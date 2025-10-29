#!/bin/bash

# Quick Setup Script for LeverageTherapy.app on SSDNodes VPS
# Run this script on your VPS after cloning the repository

set -e  # Exit on error

echo "================================"
echo "LeverageTherapy.app Setup Script"
echo "================================"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "Please run as root (use: sudo bash setup.sh)"
    exit 1
fi

# Get VPS IP address
VPS_IP=$(curl -s ifconfig.me)
echo "Detected VPS IP: $VPS_IP"
echo ""

# Update system
echo "📦 Updating system packages..."
apt update && apt upgrade -y

# Install Docker if not installed
if ! command -v docker &> /dev/null; then
    echo "🐳 Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
else
    echo "✅ Docker already installed"
fi

# Install Docker Compose if not installed
if ! command -v docker-compose &> /dev/null; then
    echo "🐳 Installing Docker Compose..."
    apt install docker-compose -y
else
    echo "✅ Docker Compose already installed"
fi

# Install Nginx if not installed
if ! command -v nginx &> /dev/null; then
    echo "🌐 Installing Nginx..."
    apt install nginx -y
else
    echo "✅ Nginx already installed"
fi

# Install Certbot if not installed
if ! command -v certbot &> /dev/null; then
    echo "🔒 Installing Certbot..."
    apt install certbot python3-certbot-nginx -y
else
    echo "✅ Certbot already installed"
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo ""
    echo "📝 Creating .env file..."
    echo "Please provide the following information:"
    echo ""
    
    read -p "Database URL (e.g., mysql://user:pass@host:3306/db): " DB_URL
    
    # Generate JWT secret
    JWT_SECRET=$(openssl rand -base64 32)
    echo "Generated JWT_SECRET: $JWT_SECRET"
    
    read -p "Webhook API Key (press Enter to generate): " WEBHOOK_KEY
    if [ -z "$WEBHOOK_KEY" ]; then
        WEBHOOK_KEY=$(openssl rand -base64 24)
        echo "Generated WEBHOOK_API_KEY: $WEBHOOK_KEY"
    fi
    
    cat > .env << EOF
# Database Configuration
DATABASE_URL=$DB_URL

# Security
JWT_SECRET=$JWT_SECRET
WEBHOOK_API_KEY=$WEBHOOK_KEY

# Application Settings
VITE_APP_TITLE=LeverageTherapy
NODE_ENV=production
EOF
    
    echo "✅ .env file created"
    echo ""
    echo "⚠️  IMPORTANT: Save these credentials securely!"
    echo "   WEBHOOK_API_KEY: $WEBHOOK_KEY"
    echo ""
else
    echo "✅ .env file already exists"
fi

# Configure Nginx
echo ""
echo "🌐 Configuring Nginx..."
cp nginx/leveragetherapy.com.conf /etc/nginx/sites-available/leveragetherapy.com

# Remove default site if exists
if [ -f /etc/nginx/sites-enabled/default ]; then
    rm /etc/nginx/sites-enabled/default
fi

# Enable site
ln -sf /etc/nginx/sites-available/leveragetherapy.com /etc/nginx/sites-enabled/

# Test Nginx config
nginx -t

# Reload Nginx
systemctl reload nginx
echo "✅ Nginx configured"

# Configure firewall
echo ""
echo "🔥 Configuring firewall..."
ufw allow 22/tcp   # SSH
ufw allow 80/tcp   # HTTP
ufw allow 443/tcp  # HTTPS
ufw --force enable
echo "✅ Firewall configured"

# Build and start Docker containers
echo ""
echo "🐳 Building and starting Docker containers..."
docker-compose build
docker-compose up -d

# Wait for app to start
echo "⏳ Waiting for application to start..."
sleep 10

# Check if app is running
if docker-compose ps | grep -q "Up"; then
    echo "✅ Application is running"
else
    echo "❌ Application failed to start. Check logs with: docker-compose logs"
    exit 1
fi

# Push database schema
echo ""
echo "📊 Pushing database schema..."
docker-compose exec -T app sh -c "cd /app && pnpm db:push" || echo "⚠️  Database push failed - you may need to run this manually"

echo ""
echo "================================"
echo "✅ Setup Complete!"
echo "================================"
echo ""
echo "Your application is now running at:"
echo "  http://$VPS_IP:3000"
echo "  http://leveragetherapy.com (after DNS propagates)"
echo ""
echo "Next steps:"
echo ""
echo "1. Configure DNS for leveragetherapy.com:"
echo "   - Add A record: @ → $VPS_IP"
echo "   - Add A record: www → $VPS_IP"
echo ""
echo "2. Wait for DNS to propagate (5 mins - 48 hours)"
echo ""
echo "3. Set up SSL certificate:"
echo "   certbot --nginx -d leveragetherapy.com -d www.leveragetherapy.com"
echo ""
echo "4. Your webhook API key is:"
echo "   $WEBHOOK_KEY"
echo "   (Also saved in .env file)"
echo ""
echo "5. View logs:"
echo "   docker-compose logs -f app"
echo ""
echo "6. Restart application:"
echo "   docker-compose restart app"
echo ""
echo "See DOMAIN_SETUP.md for detailed instructions."
echo ""
