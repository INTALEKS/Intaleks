#!/bin/bash

# PostgreSQL Database Setup Script
# Run this as the deploy user after server setup

set -e

echo "🐘 PostgreSQL Database Setup"
echo ""

# Prompt for database details
read -p "Enter database name [default: app_db]: " DB_NAME
DB_NAME=${DB_NAME:-app_db}

read -p "Enter database user [default: app_user]: " DB_USER
DB_USER=${DB_USER:-app_user}

read -sp "Enter database password: " DB_PASSWORD
echo ""

if [ -z "$DB_PASSWORD" ]; then
    echo "❌ Password cannot be empty!"
    exit 1
fi

# Create database and user
echo "Creating database and user..."
sudo -u postgres psql <<EOF
CREATE DATABASE $DB_NAME;
CREATE USER $DB_USER WITH ENCRYPTED PASSWORD '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
ALTER DATABASE $DB_NAME OWNER TO $DB_USER;
\c $DB_NAME
GRANT ALL ON SCHEMA public TO $DB_USER;
EOF

echo ""
echo "✅ Database setup complete!"
echo ""
echo "Your DATABASE_URL:"
echo "postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME"
echo ""
echo "⚠️  Save this connection string securely!"
