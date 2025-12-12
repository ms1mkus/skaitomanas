# Production Deployment - Quick Start Guide

## Prerequisites

- Node.js 20+ installed
- PostgreSQL database running
- Server with at least 1GB RAM

## Step 1: Build the Application

```bash
# Build backend
cd backend
npm install
npm run build

# Build frontend
cd ../frontend
npm install
npm run build
```

## Step 2: Configure Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cd backend
nano .env  # or use your preferred editor
```

Add these variables (replace with your actual values):

```env
PORT=3000
NODE_ENV=production

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/skaitomanas

# JWT Secrets - Generate strong random values
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this

# File Upload
UPLOAD_DIR=public/uploads
MAX_FILE_SIZE=5242880
```

**Generate strong secrets:**
```bash
# Generate random secrets
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Step 3: Setup Database

```bash
cd backend
npm run migrate
npm run seed  # Optional: adds sample data
```

## Step 4: Create Upload Directory

```bash
cd backend
mkdir -p public/uploads
chmod 755 public/uploads
```

## Step 5: Start the Application

### Option A: Using Node directly

```bash
# Start backend
cd backend
npm start

# In another terminal, serve frontend
cd frontend
npx serve -s dist -p 5173
```

### Option B: Using PM2 (Recommended)

```bash
# Install PM2 globally
npm install -g pm2

# Start backend
cd backend
pm2 start dist/index.js --name skaitomanas-backend

# Serve frontend
cd ../frontend
pm2 serve dist 5173 --name skaitomanas-frontend --spa

# Save PM2 configuration
pm2 save
pm2 startup  # Follow instructions to enable auto-start
```

## Step 6: Setup Nginx (Optional but Recommended)

Create `/etc/nginx/sites-available/skaitomanas`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Uploaded files
    location /uploads {
        proxy_pass http://localhost:3000/uploads;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }

    # File upload size limit
    client_max_body_size 10M;
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/skaitomanas /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Step 7: Setup Backups

Create a backup script `/home/user/backup-uploads.sh`:

```bash
#!/bin/bash
BACKUP_DIR=/backups/skaitomanas
UPLOAD_DIR=/path/to/backend/public/uploads
DATE=$(date +%Y%m%d)

mkdir -p $BACKUP_DIR
tar -czf $BACKUP_DIR/uploads-$DATE.tar.gz $UPLOAD_DIR

# Keep only last 30 days
find $BACKUP_DIR -name "uploads-*.tar.gz" -mtime +30 -delete
```

Make it executable and add to crontab:
```bash
chmod +x /home/user/backup-uploads.sh
crontab -e
# Add: 0 2 * * * /home/user/backup-uploads.sh
```

## Verification

1. Visit `http://your-domain.com` (or `http://localhost:5173`)
2. Login as author: `jonas@rasytojai.lt` / `password123`
3. Go to "Mano knygos" (My Books)
4. Create a new book and upload a cover image
5. Verify the image displays correctly
6. Edit the book and replace the cover
7. Check that old file is deleted from `backend/public/uploads/`

## Troubleshooting

### Uploads not working

```bash
# Check directory permissions
ls -la backend/public/uploads

# Check logs
pm2 logs skaitomanas-backend

# Verify environment variables
cd backend && node -e "console.log(process.env.UPLOAD_DIR)"
```

### Files not cleaning up

```bash
# Check backend logs for cleanup errors
pm2 logs skaitomanas-backend --lines 100
```

### Database connection issues

```bash
# Test database connection
psql $DATABASE_URL -c "SELECT 1"
```

## Monitoring

```bash
# View application status
pm2 status

# View logs
pm2 logs

# Monitor resources
pm2 monit
```

## Security Checklist

- [ ] Changed JWT secrets to strong random values
- [ ] Database uses strong password
- [ ] Firewall configured (only ports 80, 443, 22 open)
- [ ] SSL certificate installed (use Let's Encrypt)
- [ ] Regular backups configured
- [ ] Upload directory has correct permissions (755)
- [ ] NODE_ENV set to production

## Need Help?

Check `DEPLOYMENT.md` for more detailed information about cloud storage, Docker deployment, and advanced configurations.
