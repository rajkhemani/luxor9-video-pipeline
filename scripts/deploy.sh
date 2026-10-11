#!/bin/bash
# deploy.sh - Deploy to Oracle Free Tier VM
# Usage: ./deploy.sh [staging|production]

set -e

ENVIRONMENT=${1:-production}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "🚀 Deploying OpenMontage to $ENVIRONMENT..."

# Check required env vars
required_vars=("ORACLE_HOST" "ORACLE_USER" "ORACLE_SSH_KEY")
for var in "${required_vars[@]}"; do
    if [[ -z "${!var}" ]]; then
        echo "❌ Missing required environment variable: $var"
        exit 1
    fi
done

# Build images locally
echo "📦 Building Docker images..."
cd "$PROJECT_DIR"
docker compose -f docker-compose.yml build --parallel

# Save images as tar
echo "💾 Saving images..."
mkdir -p /tmp/openmontage-deploy
docker save openmontage_pocketbase:latest | gzip > /tmp/openmontage-deploy/pocketbase.tar.gz
docker save openmontage_nginx:latest | gzip > /tmp/openmontage-deploy/nginx.tar.gz
docker save openmontage_render-worker:latest | gzip > /tmp/openmontage-deploy/render-worker.tar.gz

# Copy to Oracle VM
echo "📤 Copying to Oracle VM..."
scp -i "$ORACLE_SSH_KEY" -o StrictHostKeyChecking=no \
    /tmp/openmontage-deploy/*.tar.gz \
    "$ORACLE_USER@$ORACLE_HOST:/tmp/"

# Deploy on Oracle VM
echo "🔧 Deploying on Oracle VM..."
ssh -i "$ORACLE_SSH_KEY" -o StrictHostKeyChecking=no "$ORACLE_USER@$ORACLE_HOST" << 'ENDSSH'
    set -e
    cd /opt/openmontage
    
    # Load images
    echo "Loading Docker images..."
    docker load < /tmp/pocketbase.tar.gz
    docker load < /tmp/nginx.tar.gz
    docker load < /tmp/render-worker.tar.gz
    
    # Pull latest code
    git pull origin main
    
    # Restart services
    docker compose -f docker-compose.yml up -d --remove-orphans
    
    # Clean up
    docker system prune -f
    rm /tmp/*.tar.gz
    
    echo "✅ Deployment complete!"
ENDSSH

# Cleanup local
rm -rf /tmp/openmontage-deploy

echo "🎉 Deployment to $ENVIRONMENT complete!"
echo "🌐 Check: https://api.yourdomain.com/api/health"