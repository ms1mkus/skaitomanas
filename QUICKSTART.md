# Quick Start - Linode Deployment

Fast track guide to deploy Skaitomanas on Linode.

## Prerequisites

- Linode server (Ubuntu 22.04, 2GB+ RAM)
- DuckDNS account with subdomain created
- SSH access to server

## 1. Server Setup (One-time)

```bash
# SSH into server
ssh root@<your-linode-ip>

# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
apt install docker-compose-plugin -y

# Setup firewall
apt install ufw -y
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 443/udp
ufw enable
```

## 2. DuckDNS Setup (One-time)

1. Go to https://www.duckdns.org/
2. Sign in and create a subdomain (e.g., `myapp.duckdns.org`)
3. Point it to your Linode IP
4. Save your DuckDNS token

## 3. Deploy Application

```bash
# Clone repository
cd ~
git clone <your-repo-url> skaitomanas
cd skaitomanas

# Configure environment
cp .env.example .env
nano .env
```

**Edit `.env` with:**
- `DOMAIN=myapp.duckdns.org` (your DuckDNS subdomain)
- `DUCKDNS_TOKEN=your-token` (from DuckDNS)
- `DB_PASSWORD=strong-password`
- `JWT_SECRET=` (generate with command below)
- `JWT_REFRESH_SECRET=` (generate with command below)

**Generate secrets:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Deploy:**
```bash
chmod +x deploy-linode.sh
./deploy-linode.sh
```

## 4. Access Application

Visit `https://myapp.duckdns.org` (replace with your domain)

**Note:** First HTTPS access may take 30-60 seconds while Caddy generates SSL certificate.

## Common Commands

```bash
# View logs
docker compose logs -f

# Check status
docker compose ps

# Restart services
docker compose restart

# Stop all
docker compose down

# Update application
git pull && docker compose up -d --build
```

## Troubleshooting

**Services not starting:**
```bash
docker compose logs
```

**HTTPS not working:**
- Verify DuckDNS domain resolves to your IP: `nslookup myapp.duckdns.org`
- Check Caddy logs: `docker compose logs caddy`
- Verify DUCKDNS_TOKEN in `.env`

**Database issues:**
```bash
docker compose exec db psql -U skaitomanas -d skaitomanas -c "SELECT 1"
```

## Full Documentation

See [LINODE_DEPLOYMENT.md](./LINODE_DEPLOYMENT.md) for complete guide.
