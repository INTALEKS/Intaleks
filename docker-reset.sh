#!/bin/bash

# Reset Docker environment and database
# WARNING: This will delete all data!

set -e

echo "⚠️  WARNING: This will delete all Docker volumes and data!"
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Reset cancelled"
    exit 0
fi

echo "🛑 Stopping all containers..."
docker-compose down

echo "🗑️  Removing volumes..."
docker-compose down -v

echo "🧹 Cleaning up..."
docker system prune -f

echo "✅ Reset complete! Run ./setup-dev.sh to reinitialize."
