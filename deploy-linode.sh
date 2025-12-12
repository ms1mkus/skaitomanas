#!/bin/bash

# Linode Deployment Script for Skaitomanas
# This script automates the Docker deployment process

set -e  # Exit on error

echo "🚀 Starting Skaitomanas Linode Deployment..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored messages
print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if .env exists
if [ ! -f ".env" ]; then
    print_error "Error: .env file not found"
    echo "Please create .env file from .env.example:"
    echo "  cp .env.example .env"
    echo "  nano .env"
    exit 1
fi

print_success ".env file found"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed"
    echo "Please install Docker first:"
    echo "  curl -fsSL https://get.docker.com -o get-docker.sh"
    echo "  sudo sh get-docker.sh"
    exit 1
fi

print_success "Docker is installed"

# Check if Docker Compose is available
if ! docker compose version &> /dev/null; then
    print_error "Docker Compose is not available"
    echo "Please install Docker Compose plugin"
    exit 1
fi

print_success "Docker Compose is available"

# Validate required environment variables
print_info "Validating environment variables..."

source .env

if [ -z "$DOMAIN" ] || [ "$DOMAIN" = "yourapp.duckdns.org" ]; then
    print_warning "DOMAIN is not configured in .env"
    print_warning "Using localhost for local testing"
fi

if [ -z "$DUCKDNS_TOKEN" ] || [ "$DUCKDNS_TOKEN" = "your-duckdns-token-here" ]; then
    print_warning "DUCKDNS_TOKEN is not configured"
    print_warning "HTTPS will not work without a valid DuckDNS token"
fi

if [ -z "$JWT_SECRET" ] || [ "$JWT_SECRET" = "your-super-secret-jwt-key-change-this-in-production" ]; then
    print_error "JWT_SECRET is not configured properly"
    echo "Generate a strong secret with:"
    echo "  node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
    exit 1
fi

if [ -z "$JWT_REFRESH_SECRET" ] || [ "$JWT_REFRESH_SECRET" = "your-super-secret-refresh-key-change-this-in-production" ]; then
    print_error "JWT_REFRESH_SECRET is not configured properly"
    echo "Generate a strong secret with:"
    echo "  node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
    exit 1
fi

print_success "Environment variables validated"

# Stop existing containers
print_info "Stopping existing containers..."
docker compose down 2>/dev/null || true
print_success "Existing containers stopped"

# Build images
print_info "Building Docker images (this may take a few minutes)..."
docker compose build --no-cache
print_success "Docker images built successfully"

# Start services
print_info "Starting services..."
docker compose up -d
print_success "Services started"

# Wait for database to be ready
print_info "Waiting for database to be ready..."
sleep 10

# Check if database is healthy
DB_HEALTH=$(docker compose ps db --format json | grep -o '"Health":"[^"]*"' | cut -d'"' -f4)
if [ "$DB_HEALTH" != "healthy" ]; then
    print_warning "Database is not healthy yet, waiting..."
    sleep 10
fi

print_success "Database is ready"

# Run migrations
print_info "Running database migrations..."
docker compose exec -T backend npm run migrate
print_success "Database migrations completed"

# Wait for all services to be healthy
print_info "Waiting for all services to be healthy..."
sleep 15

# Check service status
print_info "Checking service status..."
docker compose ps

# Verify all services are running
SERVICES=("db" "backend" "frontend" "caddy")
ALL_HEALTHY=true

for service in "${SERVICES[@]}"; do
    STATUS=$(docker compose ps $service --format "{{.Status}}")
    if [[ $STATUS == *"Up"* ]]; then
        print_success "$service is running"
    else
        print_error "$service is not running properly"
        ALL_HEALTHY=false
    fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ "$ALL_HEALTHY" = true ]; then
    print_success "Deployment completed successfully!"
    echo ""
    echo "🌐 Your application is now running!"
    echo ""
    
    if [ "$DOMAIN" != "localhost" ] && [ "$DOMAIN" != "yourapp.duckdns.org" ]; then
        echo "   Production URL: https://$DOMAIN"
        echo ""
        print_info "HTTPS certificate will be automatically generated on first access"
        print_info "This may take 30-60 seconds"
    else
        echo "   Local URL: http://localhost"
        echo ""
        print_warning "Running in local mode (no HTTPS)"
        print_warning "Configure DOMAIN and DUCKDNS_TOKEN in .env for production"
    fi
    
    echo ""
    echo "📊 Useful commands:"
    echo "   docker compose logs -f        # View logs"
    echo "   docker compose ps             # Check status"
    echo "   docker compose restart        # Restart all services"
    echo "   docker compose down           # Stop all services"
    echo ""
    echo "📚 For more information, see LINODE_DEPLOYMENT.md"
else
    print_error "Deployment completed with errors"
    echo ""
    echo "Check logs with: docker compose logs"
    echo "For troubleshooting, see LINODE_DEPLOYMENT.md"
    exit 1
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
