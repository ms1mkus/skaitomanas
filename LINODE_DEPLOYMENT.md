# Linode Deployment Guide

Complete guide for deploying Skaitomanas on a Linode server using Docker, Caddy, and DuckDNS.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Server Setup](#server-setup)
3. [DuckDNS Configuration](#duckdns-configuration)
4. [Application Deployment](#application-deployment)
5. [Database Management](#database-management)
6. [Monitoring & Maintenance](#monitoring--maintenance)
7. [Troubleshooting](#troubleshooting)
8. [Security Best Practices](#security-best-practices)

---

## Prerequisites

### Required Accounts & Services

- **Linode Account**: Sign up at [linode.com](https://www.linode.com/)
- **DuckDNS Account**: Free dynamic DNS at [duckdns.org](https://www.duckdns.org/)
- **Git**: For cloning the repository

### Recommended Linode Plan

- **Minimum**: Linode 2GB (Nanode) - $5/month
  - 1 CPU Core
  - 2GB RAM
  - 50GB SSD Storage
  - Suitable for small to medium traffic

- **Recommended**: Linode 4GB - $12/month
  - 2 CPU Cores
  - 4GB RAM
  - 80GB SSD Storage
  - Better performance for production

### Local Requirements

- SSH client
- Basic Linux command line knowledge

---

## Server Setup

### 1. Create Linode Instance

1. Log in to Linode Cloud Manager
2. Click **Create** → **Linode**
3. Choose:
   - **Distribution**: Ubuntu 22.04 LTS (recommended)
   - **Region**: Choose closest to your users
   - **Plan**: Linode 2GB or higher
   - **Root Password**: Set a strong password
   - **SSH Keys**: Add your public key (recommended)
4. Click **Create Linode**
5. Wait for the instance to boot (status: Running)

### 2. Initial Server Configuration

SSH into your server:

```bash
ssh root@<your-linode-ip>
```

#### Update System

```bash
apt update && apt upgrade -y
```

#### Create Non-Root User

```bash
# Create user
adduser skaitomanas

# Add to sudo group
usermod -aG sudo skaitomanas

# Switch to new user
su - skaitomanas
```

#### Configure Firewall

```bash
# Install UFW if not present
sudo apt install ufw -y

# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 443/udp  # HTTP/3

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

### 3. Install Docker

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt install docker-compose-plugin -y

# Verify installation
docker --version
docker compose version

# Log out and back in for group changes to take effect
exit
```

Log back in:
```bash
ssh skaitomanas@<your-linode-ip>
```

---

## DuckDNS Configuration

### 1. Create DuckDNS Account

1. Go to [duckdns.org](https://www.duckdns.org/)
2. Sign in with your preferred method (Google, GitHub, etc.)
3. You'll see your **token** at the top - save this securely

### 2. Create Subdomain

1. In the **domains** section, enter your desired subdomain
   - Example: `skaitomanas` → `skaitomanas.duckdns.org`
2. Click **Add domain**
3. Enter your Linode server's IP address
4. Click **Update IP**

### 3. Test DNS Resolution

Wait 1-2 minutes, then test:

```bash
# From your local machine
ping skaitomanas.duckdns.org

# Should resolve to your Linode IP
```

---

## Application Deployment

### 1. Clone Repository

```bash
# Clone the repository
cd ~
git clone https://github.com/yourusername/skaitomanas.git
cd skaitomanas
```

### 2. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit environment file
nano .env
```

**Required Configuration:**

```env
# Your DuckDNS subdomain
DOMAIN=skaitomanas.duckdns.org

# Your DuckDNS token from https://www.duckdns.org/
DUCKDNS_TOKEN=your-token-here

# Database credentials (change these!)
DB_USER=skaitomanas
DB_PASSWORD=use-a-strong-random-password-here
DB_NAME=skaitomanas

# JWT Secrets (generate strong random values)
JWT_SECRET=generate-with-command-below
JWT_REFRESH_SECRET=generate-with-command-below
JWT_EXPIRES_IN=7d

# File upload limit (5MB)
MAX_FILE_SIZE=5242880

# Frontend API URL
VITE_API_URL=/api
```

**Generate JWT Secrets:**

```bash
# Generate JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate JWT_REFRESH_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the generated values into your `.env` file.

### 3. Deploy Application

```bash
# Make deployment script executable
chmod +x deploy-linode.sh

# Run deployment
./deploy-linode.sh
```

The script will:
- Build all Docker images
- Start all services
- Run database migrations
- Verify health checks

### 4. Verify Deployment

```bash
# Check all containers are running
docker compose ps

# Should show 4 services: db, backend, frontend, caddy
# All should be in "Up" state with "healthy" status

# Check logs
docker compose logs -f

# Press Ctrl+C to exit logs
```

### 5. Access Your Application

Open your browser and navigate to:
- **Production**: `https://skaitomanas.duckdns.org` (or your domain)
- **HTTP** will automatically redirect to **HTTPS**

**First-time HTTPS Certificate:**
- Caddy will automatically request a Let's Encrypt certificate
- This may take 30-60 seconds on first access
- Certificate auto-renews before expiration

---

## Database Management

### Running Migrations

Migrations run automatically during deployment, but you can run them manually:

```bash
# Enter backend container
docker compose exec backend sh

# Run migrations
npm run migrate

# Exit container
exit
```

### Seeding Sample Data

```bash
# Enter backend container
docker compose exec backend sh

# Run seed
npm run seed

# Exit
exit
```

### Database Backup

```bash
# Create backup directory
mkdir -p ~/backups

# Backup database
docker compose exec db pg_dump -U skaitomanas skaitomanas > ~/backups/backup-$(date +%Y%m%d-%H%M%S).sql

# Verify backup
ls -lh ~/backups/
```

**Automated Backups with Cron:**

```bash
# Create backup script
cat > ~/backup-db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR=~/backups
mkdir -p $BACKUP_DIR
cd ~/skaitomanas
docker compose exec -T db pg_dump -U skaitomanas skaitomanas > $BACKUP_DIR/backup-$(date +%Y%m%d-%H%M%S).sql

# Keep only last 30 days
find $BACKUP_DIR -name "backup-*.sql" -mtime +30 -delete
EOF

# Make executable
chmod +x ~/backup-db.sh

# Add to crontab (daily at 2 AM)
crontab -e

# Add this line:
0 2 * * * ~/backup-db.sh
```

### Restore Database

```bash
# Stop backend to prevent connections
docker compose stop backend

# Restore from backup
cat ~/backups/backup-20250112-020000.sql | docker compose exec -T db psql -U skaitomanas skaitomanas

# Start backend
docker compose start backend
```

---

## Monitoring & Maintenance

### View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f caddy
docker compose logs -f db

# Last 100 lines
docker compose logs --tail=100 backend
```

### Check Resource Usage

```bash
# Container stats
docker stats

# Disk usage
df -h

# Docker disk usage
docker system df
```

### Restart Services

```bash
# Restart all services
docker compose restart

# Restart specific service
docker compose restart backend

# Restart with rebuild
docker compose up -d --build backend
```

### Update Application

```bash
cd ~/skaitomanas

# Pull latest code
git pull

# Rebuild and restart
docker compose up -d --build

# Run migrations if needed
docker compose exec backend npm run migrate
```

### Clean Up Docker Resources

```bash
# Remove unused images
docker image prune -a

# Remove unused volumes (CAREFUL!)
docker volume prune

# Remove everything unused
docker system prune -a
```

---

## Troubleshooting

### Service Won't Start

```bash
# Check logs for errors
docker compose logs backend

# Check if port is already in use
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :443

# Restart service
docker compose restart backend
```

### HTTPS Certificate Issues

```bash
# Check Caddy logs
docker compose logs caddy

# Verify DuckDNS is resolving correctly
nslookup skaitomanas.duckdns.org

# Verify DUCKDNS_TOKEN is correct in .env
cat .env | grep DUCKDNS_TOKEN

# Restart Caddy to retry certificate
docker compose restart caddy
```

### Database Connection Errors

```bash
# Check database is running
docker compose ps db

# Check database logs
docker compose logs db

# Test database connection
docker compose exec db psql -U skaitomanas -d skaitomanas -c "SELECT 1"

# Verify DATABASE_URL in backend
docker compose exec backend env | grep DATABASE
```

### Upload Files Not Working

```bash
# Check uploads volume
docker volume inspect skaitomanas_uploads

# Check backend has write permissions
docker compose exec backend ls -la /app/public/uploads

# Check volume mount
docker compose exec backend df -h /app/public/uploads
```

### Out of Disk Space

```bash
# Check disk usage
df -h

# Clean Docker resources
docker system prune -a -f

# Remove old backups
find ~/backups -name "backup-*.sql" -mtime +7 -delete

# Check large files
du -sh ~/skaitomanas/*
```

### High Memory Usage

```bash
# Check container memory
docker stats

# Restart services to free memory
docker compose restart

# Consider upgrading Linode plan
```

---

## Security Best Practices

### 1. SSH Hardening

```bash
# Disable root login
sudo nano /etc/ssh/sshd_config

# Set: PermitRootLogin no
# Set: PasswordAuthentication no (if using SSH keys)

# Restart SSH
sudo systemctl restart sshd
```

### 2. Keep System Updated

```bash
# Update system regularly
sudo apt update && sudo apt upgrade -y

# Enable automatic security updates
sudo apt install unattended-upgrades -y
sudo dpkg-reconfigure -plow unattended-upgrades
```

### 3. Monitor Failed Login Attempts

```bash
# Install fail2ban
sudo apt install fail2ban -y

# Enable and start
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 4. Regular Backups

- Database: Daily automated backups (see Database Backup section)
- Uploads: Backup the uploads volume regularly
- Configuration: Keep `.env` file backed up securely (encrypted)

### 5. Environment Variables

- Never commit `.env` to git
- Use strong, random passwords
- Rotate JWT secrets periodically
- Keep DuckDNS token secure

### 6. Monitor Logs

```bash
# Check for suspicious activity
docker compose logs | grep -i error
docker compose logs | grep -i fail

# Monitor authentication attempts
docker compose logs backend | grep -i auth
```

---

## Performance Optimization

### Enable Docker Logging Limits

Edit `docker-compose.yml` to add logging limits:

```yaml
services:
  backend:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

### Database Optimization

```bash
# Enter database container
docker compose exec db psql -U skaitomanas skaitomanas

# Analyze and vacuum
VACUUM ANALYZE;

# Exit
\q
```

---

## Support & Resources

- **Linode Documentation**: https://www.linode.com/docs/
- **Docker Documentation**: https://docs.docker.com/
- **Caddy Documentation**: https://caddyserver.com/docs/
- **DuckDNS**: https://www.duckdns.org/

---

## Quick Reference Commands

```bash
# Start all services
docker compose up -d

# Stop all services
docker compose down

# View logs
docker compose logs -f

# Restart service
docker compose restart backend

# Update application
git pull && docker compose up -d --build

# Backup database
docker compose exec db pg_dump -U skaitomanas skaitomanas > backup.sql

# Check status
docker compose ps
```
