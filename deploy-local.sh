#!/bin/bash

# deploy-local.sh
# Run this on your LOCAL machine to build the frontend and prepare deployment.

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🚀 Starting Local Build Process for Skaitomanas...${NC}"

# 1. Build Frontend
echo -e "\n${YELLOW}📦 Building Frontend...${NC}"
cd frontend
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm ci
fi
npm run build
cd ..

if [ ! -d "frontend/dist" ]; then
    echo -e "${RED}❌ Frontend build failed! 'dist' directory not found.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Frontend built successfully${NC}"

# 2. Package for Deployment
echo -e "\n${YELLOW}📦 Packaging for Deployment...${NC}"
DEPLOY_ARCHIVE="skaitomanas-deploy.tar.gz"

# Exclude unnecessary files
tar -czf $DEPLOY_ARCHIVE \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='.env' \
    --exclude='readme_screenshots' \
    backend \
    frontend/dist \
    frontend/Dockerfile \
    docker-compose.yml \
    Caddyfile \
    deploy-linode.sh

echo -e "${GREEN}✓ Created deployment archive: $DEPLOY_ARCHIVE${NC}"
ls -lh $DEPLOY_ARCHIVE

# 3. Instructions
echo -e "\n${GREEN}✅ Build Complete!${NC}"
echo -e "Now, copy the archive to your Linode server:"
echo -e ""
echo -e "  ${YELLOW}scp $DEPLOY_ARCHIVE root@<YOUR_LINODE_IP>:/root/skaitomanas/${NC}"
echo -e ""
echo -e "Then ssh into your server and deploy:"
echo -e ""
echo -e "  ${YELLOW}ssh root@<YOUR_LINODE_IP>${NC}"
echo -e "  ${YELLOW}cd skaitomanas${NC}"
echo -e "  ${YELLOW}tar -xzf $DEPLOY_ARCHIVE${NC}"
echo -e "  ${YELLOW}./deploy-linode.sh${NC}"
echo -e ""
