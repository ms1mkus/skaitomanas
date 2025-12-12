#!/bin/bash

# Production Deployment Script for Skaitomanas
# This script automates the deployment process

set -e  # Exit on error

echo "🚀 Starting Skaitomanas Production Deployment..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .env exists
if [ ! -f "backend/.env" ]; then
    echo -e "${RED}❌ Error: backend/.env file not found${NC}"
    echo "Please create backend/.env with your production configuration"
    echo "See backend/.env.example for reference"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo -e "${RED}❌ Error: Node.js 20+ required (found: $(node -v))${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} Node.js version check passed"

# Build backend
echo -e "${YELLOW}📦 Building backend...${NC}"
cd backend
npm install --production=false
npm run build
echo -e "${GREEN}✓${NC} Backend built successfully"

# Build frontend
echo -e "${YELLOW}📦 Building frontend...${NC}"
cd ../frontend
npm install --production=false
npm run build
echo -e "${GREEN}✓${NC} Frontend built successfully"

# Create upload directory
echo -e "${YELLOW}📁 Setting up upload directory...${NC}"
cd ../backend
mkdir -p public/uploads
chmod 755 public/uploads
echo -e "${GREEN}✓${NC} Upload directory ready"

# Run migrations
echo -e "${YELLOW}🗄️  Running database migrations...${NC}"
npm run migrate
echo -e "${GREEN}✓${NC} Database migrations completed"

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}⚠️  PM2 not found. Installing PM2...${NC}"
    npm install -g pm2
fi

# Stop existing processes
echo -e "${YELLOW}🛑 Stopping existing processes...${NC}"
pm2 delete skaitomanas-backend 2>/dev/null || true
pm2 delete skaitomanas-frontend 2>/dev/null || true

# Start backend
echo -e "${YELLOW}🚀 Starting backend...${NC}"
cd backend
pm2 start dist/index.js --name skaitomanas-backend

# Start frontend
echo -e "${YELLOW}🚀 Starting frontend...${NC}"
cd ../frontend
pm2 serve dist 5173 --name skaitomanas-frontend --spa

# Save PM2 configuration
pm2 save

echo ""
echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo ""
echo "📊 Application Status:"
pm2 status
echo ""
echo "🌐 Access your application:"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:3000"
echo ""
echo "📝 Useful commands:"
echo "   pm2 logs              - View logs"
echo "   pm2 monit             - Monitor resources"
echo "   pm2 restart all       - Restart all services"
echo "   pm2 stop all          - Stop all services"
echo ""
echo "⚠️  Don't forget to:"
echo "   1. Configure Nginx reverse proxy (see PRODUCTION_SETUP.md)"
echo "   2. Setup SSL certificate"
echo "   3. Configure firewall"
echo "   4. Setup backup cron job"
echo ""
