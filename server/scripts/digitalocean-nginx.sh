#!/bin/bash

# Nginx Configuration Script
# Run this as deploy user (will use sudo for nginx commands)

set -e

echo "🌐 Nginx Configuration Setup"
echo ""

# Prompt for domain
read -p "Enter your domain name (or press Enter to use IP): " DOMAIN
read -p "Enter backend port [default: 4545]: " PORT
PORT=${PORT:-4545}

if [ -z "$DOMAIN" ]; then
    DOMAIN="_"
    USE_IP=true
else
    USE_IP=false
fi

# Create Nginx configuration
NGINX_CONF="/etc/nginx/sites-available/backend"

echo "Creating Nginx configuration..."
sudo tee $NGINX_CONF > /dev/null <<EOF
server {
    listen 80;
    server_name $DOMAIN;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Increase body size for file uploads
    client_max_body_size 50M;

    location / {
        proxy_pass http://localhost:$PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health check endpoint
    location /health {
        proxy_pass http://localhost:$PORT/health;
        access_log off;
    }
}
EOF

# Enable site
echo "Enabling site..."
sudo ln -sf $NGINX_CONF /etc/nginx/sites-enabled/backend

# Remove default site if exists
sudo rm -f /etc/nginx/sites-enabled/default

# Test configuration
echo "Testing Nginx configuration..."
sudo nginx -t

# Restart Nginx
echo "Restarting Nginx..."
sudo systemctl restart nginx

echo ""
echo "✅ Nginx configuration complete!"
echo ""

if [ "$USE_IP" = false ]; then
    echo "🔒 Setup SSL certificate? (y/n)"
    read -p "> " SETUP_SSL
    
    if [ "$SETUP_SSL" = "y" ]; then
        echo "Setting up Let's Encrypt SSL..."
        sudo certbot --nginx -d $DOMAIN --non-interactive --agree-tos --register-unsafely-without-email || \
        sudo certbot --nginx -d $DOMAIN
        
        echo "✅ SSL certificate installed!"
    fi
else
    echo "Access your API at: http://YOUR_SERVER_IP"
    echo "To setup SSL later, run: sudo certbot --nginx -d your-domain.com"
fi

echo ""
echo "Nginx status:"
sudo systemctl status nginx --no-pager
