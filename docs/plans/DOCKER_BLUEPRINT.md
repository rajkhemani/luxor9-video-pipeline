# Complete Docker & Container Blueprint
## By: Gordon (Docker AI Assistant)
## Date: 2026-06-19
## User: luxoranova (rajkhemani24@gmail.com)

---

## 📋 TABLE OF CONTENTS
1. [System Audit Summary](#system-audit)
2. [Docker Optimization Blueprint](#optimization)
3. [N8N Production Deployment](#n8n-production)
4. [AI Coding Project Setup](#ai-coding-setup)
5. [CI/CD Pipeline Blueprint](#cicd)
6. [Microservices Architecture](#microservices)
7. [Development Environment](#dev-environment)
8. [Security & Hardening](#security)
9. [Monitoring & Observability](#monitoring)
10. [Action Plan & Next Steps](#action-plan)

---

## <a name="system-audit"></a>1. SYSTEM AUDIT SUMMARY

### Current State
- **Docker Desktop:** 4.78.0 | **Engine:** 29.5.3
- **OS:** Windows with WSL2 (Kernel 6.18.33.1)
- **Resources:** 16 CPUs, 15.22GB RAM
- **Images:** 6 total (4.677GB) | **Containers:** 4 (3 running, 1 stopped)
- **Volumes:** 2 local, 1.159GB used
- **Storage Waste:** 2.713GB (58% of images reclaimable)

### Current Images
| Image | Size | Status | Built |
|-------|------|--------|-------|
| n8n:latest | 2.47GB | Active | 16h ago (DHI Node.js) |
| kindest/node:v1.36.1 | 1.31GB | Unused | 2w ago (Kubernetes) |
| desktop-cloud-provider-kind | 595MB | Unused | 12w ago (Desktop) |
| envoyproxy/envoy | 248MB | Present | 6m ago (Proxy) |
| desktop-containerd-registry-mirror | 50.3MB | Support | 12w ago |
| luxoranova/ai_coding | 8.55kB | Your Image | Minimal |

### Current Containers
- **dazzling_euler** (kindest/node): Exited with permission error on /sys mount

### Login Account
- **Username:** luxoranova
- **Email:** rajkhemani29@gmail.com (primary), rajkhemani24@gmail.com (secondary)
- **Plan:** Personal
- **Registry:** Docker Hub authenticated

---

## <a name="optimization"></a>2. DOCKER OPTIMIZATION BLUEPRINT

### 2.1 Immediate Cleanup (Free 2.7GB)
```bash
# Remove unused images
docker image prune -a --force

# Remove stopped containers
docker container prune --force

# Check space freed
docker system df
```

### 2.2 Image Size Optimization Strategy

#### For N8N (Current: 2.47GB → Target: ~1.2GB)
**Current Layers:**
- DHI Node.js 24.15.0: 160MB
- Node modules (n8n): 1.84GB
- Build artifacts: 413MB

**Optimization:**
```dockerfile
# Multi-stage build for n8n
FROM dhi/pkg-node:24.15.0-alpine as builder
WORKDIR /build
RUN npm install -g n8n
RUN npm cache clean --force

FROM dhi/pkg-node:24.15.0-alpine as runtime
RUN addgroup -g 1000 node && adduser -D -u 1000 -G node node
COPY --from=builder --chown=node:node /usr/local/lib/node_modules /usr/local/lib/node_modules
WORKDIR /home/node
USER node
EXPOSE 5678
ENTRYPOINT ["tini", "--", "node", "/usr/local/lib/node_modules/n8n/bin/n8n.js"]

# Build: docker build -t luxoranova/n8n:optimized .
# Expected size: ~900MB (64% reduction)
```

#### For AI Coding (Current: 8.55kB → Multi-stage)
```dockerfile
# ai_coding Dockerfile
FROM python:3.11-slim as base
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

FROM base as dev
RUN pip install --no-cache-dir pytest debugpy

FROM python:3.11-slim as prod
WORKDIR /app
COPY --from=base /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=base /usr/local/bin /usr/local/bin
COPY src /app/src
ENV PYTHONUNBUFFERED=1
CMD ["python", "-m", "src.main"]
```

### 2.3 Layer Caching Optimization

**Best Practices:**
1. Order Dockerfile commands by change frequency (least → most)
2. Separate dependency installation from code copy
3. Use `.dockerignore` to exclude unnecessary files

**.dockerignore Example:**
```
.git
.gitignore
.vscode
.env
*.log
node_modules/
dist/
build/
__pycache__/
.pytest_cache/
*.pyc
.DS_Store
.env.local
```

### 2.4 Build Speed Optimization

```bash
# Enable BuildKit for faster builds
export DOCKER_BUILDKIT=1

# Use build cache effectively
docker build --cache-from luxoranova/n8n:latest -t luxoranova/n8n:v2 .

# Parallel builds (Buildx)
docker buildx build --platform linux/amd64,linux/arm64 -t luxoranova/n8n:multi .
```

---

## <a name="n8n-production"></a>3. N8N PRODUCTION DEPLOYMENT BLUEPRINT

### 3.1 Architecture
```
┌─────────────────┐
│   Nginx/Envoy   │ (Reverse Proxy, SSL/TLS)
│  Port 443, 80   │
└────────┬────────┘
         │
    ┌────▼─────┐
    │    N8N    │ (Port 5678 internal)
    │ Container │
    └────┬─────┘
         │
    ┌────▼──────────────┐
    │  PostgreSQL DB    │ (Persistent Volume)
    │  Port 5432        │
    └───────────────────┘
```

### 3.2 Docker Compose (Production)

**File: docker-compose.prod.yml**
```yaml
version: '3.9'

services:
  postgres:
    image: postgres:16-alpine
    container_name: n8n-db
    environment:
      POSTGRES_USER: n8n
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: n8n
    volumes:
      - postgres-data:/var/lib/postgresql/data
    networks:
      - n8n-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U n8n"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: n8n-cache
    volumes:
      - redis-data:/data
    networks:
      - n8n-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  n8n:
    image: n8nio/n8n:latest
    container_name: n8n
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    environment:
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_HOST=postgres
      - DB_POSTGRESDB_USER=n8n
      - DB_POSTGRESDB_PASSWORD=${DB_PASSWORD}
      - DB_POSTGRESDB_DATABASE=n8n
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - WEBHOOK_TUNNEL_URL=https://${DOMAIN}
      - N8N_PROTOCOL=https
      - N8N_HOST=${DOMAIN}
      - N8N_PORT=5678
      - N8N_ENCRYPTION_KEY=${ENCRYPTION_KEY}
      - N8N_LOG_LEVEL=info
    volumes:
      - n8n-data:/home/node/.n8n
    networks:
      - n8n-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5678/healthz"]
      interval: 30s
      timeout: 10s
      retries: 3
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.n8n.rule=Host(`${DOMAIN}`)"
      - "traefik.http.routers.n8n.entrypoints=websecure"
      - "traefik.http.routers.n8n.tls.certresolver=letsencrypt"
      - "traefik.http.services.n8n.loadbalancer.server.port=5678"

  traefik:
    image: traefik:v3.0
    container_name: traefik
    command:
      - "--api.insecure=false"
      - "--providers.docker=true"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.letsencrypt.acme.httpchallenge=true"
      - "--certificatesresolvers.letsencrypt.acme.httpchallenge.entrypoint=web"
      - "--certificatesresolvers.letsencrypt.acme.email=${LETSENCRYPT_EMAIL}"
      - "--certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json"
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - traefik-data:/letsencrypt
    networks:
      - n8n-network
    restart: unless-stopped

volumes:
  postgres-data:
    driver: local
  redis-data:
    driver: local
  n8n-data:
    driver: local
  traefik-data:
    driver: local

networks:
  n8n-network:
    driver: bridge
```

### 3.3 Environment Variables (.env)

```env
# Database
DB_PASSWORD=SecurePassword123!

# N8N
ENCRYPTION_KEY=$(openssl rand -base64 32)

# Domain & SSL
DOMAIN=n8n.yourdomain.com
LETSENCRYPT_EMAIL=you@example.com

# Logging
LOG_LEVEL=info

# Webhooks
WEBHOOK_TUNNEL_URL=https://n8n.yourdomain.com
```

### 3.4 Deployment Steps

```bash
# 1. Generate encryption key
openssl rand -base64 32

# 2. Create .env file with values above

# 3. Start services
docker compose -f docker-compose.prod.yml up -d

# 4. Verify health
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f n8n

# 5. Access
# https://n8n.yourdomain.com (after DNS & SSL)
```

---

## <a name="ai-coding-setup"></a>4. AI CODING PROJECT SETUP BLUEPRINT

### 4.1 Project Structure
```
luxor9-ai-coding/
├── src/
│   ├── main.py
│   ├── models/
│   ├── utils/
│   └── agents/
├── tests/
│   ├── test_main.py
│   └── test_models.py
├── Dockerfile
├── Dockerfile.dev
├── docker-compose.yml
├── docker-compose.dev.yml
├── .dockerignore
├── .env
├── requirements.txt
├── requirements-dev.txt
└── README.md
```

### 4.2 Production Dockerfile

**File: Dockerfile**
```dockerfile
# Build stage
FROM python:3.11-slim as builder
WORKDIR /build
COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# Runtime stage
FROM python:3.11-slim
RUN groupadd -r app && useradd -r -g app app
WORKDIR /app

# Copy Python dependencies from builder
COPY --from=builder --chown=app:app /root/.local /home/app/.local
ENV PATH=/home/app/.local/bin:$PATH
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# Copy application
COPY --chown=app:app src/ ./src/
USER app

EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8000/health')"

CMD ["python", "-m", "uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 4.3 Development Dockerfile

**File: Dockerfile.dev**
```dockerfile
FROM python:3.11-slim
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends \
    git curl build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements-dev.txt .
RUN pip install --no-cache-dir -r requirements-dev.txt

COPY . .
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

EXPOSE 8000
CMD ["python", "-m", "uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
```

### 4.4 Docker Compose (Dev with Hot Reload)

**File: docker-compose.dev.yml**
```yaml
version: '3.9'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.dev
    container_name: luxor9-ai-dev
    ports:
      - "8000:8000"
    volumes:
      - ./src:/app/src
      - ./tests:/app/tests
    environment:
      - DEBUG=1
      - PYTHONUNBUFFERED=1
    develop:
      watch:
        - action: sync
          path: ./src
          target: /app/src
        - action: sync
          path: ./tests
          target: /app/tests
        - action: rebuild
          path: ./requirements-dev.txt
    networks:
      - dev-network

  postgres:
    image: postgres:16-alpine
    container_name: luxor9-db-dev
    environment:
      POSTGRES_USER: dev
      POSTGRES_PASSWORD: dev123
      POSTGRES_DB: luxor9
    ports:
      - "5432:5432"
    volumes:
      - postgres-dev:/var/lib/postgresql/data
    networks:
      - dev-network

  redis:
    image: redis:7-alpine
    container_name: luxor9-redis-dev
    ports:
      - "6379:6379"
    networks:
      - dev-network

volumes:
  postgres-dev:

networks:
  dev-network:
    driver: bridge
```

### 4.5 Docker Compose (Production)

**File: docker-compose.yml**
```yaml
version: '3.9'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: luxor9-ai-prod
    ports:
      - "8000:8000"
    environment:
      - DEBUG=0
      - DATABASE_URL=postgresql://prod:${DB_PASS}@postgres:5432/luxor9
      - REDIS_URL=redis://redis:6379/0
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - app-network

  postgres:
    image: postgres:16-alpine
    container_name: luxor9-db
    environment:
      POSTGRES_USER: prod
      POSTGRES_PASSWORD: ${DB_PASS}
      POSTGRES_DB: luxor9
    volumes:
      - postgres-prod:/var/lib/postgresql/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U prod"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - app-network

  redis:
    image: redis:7-alpine
    container_name: luxor9-redis
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - app-network

volumes:
  postgres-prod:

networks:
  app-network:
    driver: bridge
```

### 4.6 Build & Deploy

```bash
# Development
docker compose -f docker-compose.dev.yml up

# Production
docker compose build --no-cache
docker compose up -d
docker compose logs -f app

# Push to registry
docker tag luxor9-ai:latest luxoranova/ai-coding:v1.0.0
docker push luxoranova/ai-coding:v1.0.0
```

---

## <a name="cicd"></a>5. CI/CD PIPELINE BLUEPRINT

### 5.1 GitHub Actions Workflow

**File: .github/workflows/build-and-deploy.yml**
```yaml
name: Build & Deploy Docker Images

on:
  push:
    branches: [main, develop]
    tags: ['v*']
  pull_request:
    branches: [main, develop]

env:
  REGISTRY: docker.io
  IMAGE_NAME: luxoranova

jobs:
  build-n8n:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    steps:
      - uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}/n8n
          tags: |
            type=ref,event=branch
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}
            type=sha

      - name: Build and push N8N image
        uses: docker/build-push-action@v5
        with:
          context: ./n8n
          file: ./n8n/Dockerfile
          push: ${{ github.event_name != 'pull_request' }}
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  build-ai-coding:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    steps:
      - uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}/ai-coding
          tags: |
            type=ref,event=branch
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}
            type=sha

      - name: Build and push AI Coding image
        uses: docker/build-push-action@v5
        with:
          context: ./ai-coding
          file: ./ai-coding/Dockerfile
          push: ${{ github.event_name != 'pull_request' }}
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  test:
    runs-on: ubuntu-latest
    needs: build-ai-coding
    steps:
      - uses: actions/checkout@v4

      - name: Log in to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Run tests
        run: |
          docker compose -f docker-compose.test.yml up --abort-on-container-exit
          docker compose -f docker-compose.test.yml down

  deploy:
    runs-on: ubuntu-latest
    needs: [build-n8n, build-ai-coding, test]
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    steps:
      - uses: actions/checkout@v4

      - name: Deploy to production
        env:
          DEPLOY_KEY: ${{ secrets.DEPLOY_KEY }}
          DEPLOY_HOST: ${{ secrets.DEPLOY_HOST }}
          DEPLOY_USER: ${{ secrets.DEPLOY_USER }}
        run: |
          mkdir -p ~/.ssh
          echo "$DEPLOY_KEY" > ~/.ssh/deploy_key
          chmod 600 ~/.ssh/deploy_key
          ssh -i ~/.ssh/deploy_key -o StrictHostKeyChecking=no \
            $DEPLOY_USER@$DEPLOY_HOST \
            "cd /app && docker pull ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}/n8n:main && \
            docker compose up -d"
```

### 5.2 GitHub Secrets Required
```
DOCKER_USERNAME=luxoranova
DOCKER_PASSWORD=<your_token>
DEPLOY_HOST=your.server.com
DEPLOY_USER=deploy
DEPLOY_KEY=<ssh_private_key>
```

### 5.3 Test Compose File

**File: docker-compose.test.yml**
```yaml
version: '3.9'

services:
  app:
    build:
      context: ./ai-coding
      dockerfile: Dockerfile.dev
    command: pytest tests/ -v --cov=src
    environment:
      - DATABASE_URL=postgresql://test:test@postgres:5432/test
      - REDIS_URL=redis://redis:6379/0
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: test
      POSTGRES_PASSWORD: test
      POSTGRES_DB: test

  redis:
    image: redis:7-alpine
```

---

## <a name="microservices"></a>6. MICROSERVICES ARCHITECTURE BLUEPRINT

### 6.1 Full Stack Architecture

```
┌─────────────────────────────────────────────────┐
│         Docker Compose Multi-Service             │
└─────────────────────────────────────────────────┘
         │
    ┌────┴─────┬─────────────┬──────────┬────────┐
    │           │             │          │        │
┌───▼──┐  ┌─────▼────┐  ┌────▼────┐ ┌──▼───┐ ┌─▼───┐
│Nginx │  │ N8N API  │  │AI Coding│ │Redis │ │Cert│
│Port: │  │Port:5678 │  │Port:8000│ │:6379 │ │Mgr │
│80,443│  │          │  │         │ │      │ │    │
└──┬───┘  └────┬─────┘  └────┬────┘ └──────┘ └────┘
   │           │             │
   │    ┌──────┴─────────────┘
   │    │
┌──▼────▼──────────────┐
│   PostgreSQL DB      │
│   Port: 5432         │
│   Volumes: data/     │
└──────────────────────┘
```

### 6.2 Master Compose File

**File: docker-compose.full.yml**
```yaml
version: '3.9'

services:
  # Reverse Proxy & Load Balancer
  nginx:
    image: nginx:alpine
    container_name: nginx-proxy
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
      - nginx-cache:/var/cache/nginx
    depends_on:
      - n8n
      - ai-api
    networks:
      - app-network
    restart: unless-stopped

  # N8N Workflow Automation
  n8n:
    image: n8nio/n8n:latest
    container_name: n8n-service
    environment:
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_HOST=postgres
      - DB_POSTGRESDB_USER=n8n
      - DB_POSTGRESDB_PASSWORD=${DB_PASSWORD}
      - DB_POSTGRESDB_DATABASE=n8n
      - REDIS_HOST=redis
      - N8N_ENCRYPTION_KEY=${N8N_ENCRYPTION_KEY}
    volumes:
      - n8n-data:/home/node/.n8n
    depends_on:
      - postgres
      - redis
    networks:
      - app-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5678/healthz"]
      interval: 30s
      timeout: 10s
      retries: 3

  # AI Coding API
  ai-api:
    build:
      context: ./ai-coding
      dockerfile: Dockerfile
    container_name: ai-api-service
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://aiuser:${AI_DB_PASSWORD}@postgres:5432/ai_coding
      - REDIS_URL=redis://redis:6379/0
      - LOG_LEVEL=info
    volumes:
      - ai-logs:/app/logs
    depends_on:
      - postgres
      - redis
    networks:
      - app-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # PostgreSQL Database
  postgres:
    image: postgres:16-alpine
    container_name: postgres-db
    environment:
      POSTGRES_INITDB_ARGS: --encoding=UTF8
      POSTGRES_MULTIPLE_DATABASES: n8n,ai_coding
    volumes:
      - ./scripts/init-databases.sh:/docker-entrypoint-initdb.d/init-databases.sh
      - postgres-data:/var/lib/postgresql/data
    networks:
      - app-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis Cache & Sessions
  redis:
    image: redis:7-alpine
    container_name: redis-cache
    command: redis-server --appendonly yes
    volumes:
      - redis-data:/data
    networks:
      - app-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Monitoring & Logging (Optional)
  prometheus:
    image: prom/prometheus:latest
    container_name: prometheus
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - prometheus-data:/prometheus
    ports:
      - "9090:9090"
    networks:
      - app-network
    restart: unless-stopped

  grafana:
    image: grafana/grafana:latest
    container_name: grafana
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASSWORD}
    volumes:
      - grafana-data:/var/lib/grafana
    ports:
      - "3000:3000"
    networks:
      - app-network
    restart: unless-stopped

volumes:
  postgres-data:
    driver: local
  redis-data:
    driver: local
  n8n-data:
    driver: local
  ai-logs:
    driver: local
  nginx-cache:
    driver: local
  prometheus-data:
    driver: local
  grafana-data:
    driver: local

networks:
  app-network:
    driver: bridge
```

### 6.3 Database Initialization Script

**File: scripts/init-databases.sh**
```bash
#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
    CREATE DATABASE n8n;
    CREATE DATABASE ai_coding;
    
    CREATE USER n8n WITH PASSWORD '$N8N_DB_PASSWORD';
    CREATE USER aiuser WITH PASSWORD '$AI_DB_PASSWORD';
    
    GRANT ALL PRIVILEGES ON DATABASE n8n TO n8n;
    GRANT ALL PRIVILEGES ON DATABASE ai_coding TO aiuser;
EOSQL
```

---

## <a name="dev-environment"></a>7. DEVELOPMENT ENVIRONMENT BLUEPRINT

### 7.1 Local Dev Setup with Hot Reload

```bash
# 1. Clone repository
git clone https://github.com/luxoranova/docker-blueprint.git
cd docker-blueprint

# 2. Create .env.local
cp .env.example .env.local

# 3. Start development stack
docker compose -f docker-compose.dev.yml up

# 4. Watch mode enabled via develop:watch
# Changes in ./src sync automatically to /app/src
```

### 7.2 Debugging in Container

**VS Code launch.json**
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Docker Debug AI API",
      "type": "python",
      "request": "attach",
      "port": 5678,
      "host": "localhost",
      "justMyCode": false,
      "pathMapping": {
        "/app": "${workspaceFolder}/ai-coding"
      }
    }
  ]
}
```

**Dockerfile.dev with debugpy**
```dockerfile
FROM python:3.11-slim
WORKDIR /app
RUN pip install debugpy
COPY requirements-dev.txt .
RUN pip install -r requirements-dev.txt
COPY . .
EXPOSE 5678 8000
CMD ["python", "-m", "debugpy.adapter", "--listen", "0.0.0.0:5678", "-m", "uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
```

### 7.3 Local Testing

```bash
# Run tests
docker compose -f docker-compose.dev.yml exec app pytest tests/ -v

# Coverage report
docker compose -f docker-compose.dev.yml exec app pytest tests/ --cov=src --cov-report=html

# Lint
docker compose -f docker-compose.dev.yml exec app black src/
docker compose -f docker-compose.dev.yml exec app flake8 src/
docker compose -f docker-compose.dev.yml exec app mypy src/
```

### 7.4 Development Utilities

**Makefile**
```makefile
.PHONY: dev test build push clean lint

dev:
	docker compose -f docker-compose.dev.yml up

dev-down:
	docker compose -f docker-compose.dev.yml down

test:
	docker compose -f docker-compose.dev.yml exec app pytest tests/ -v

coverage:
	docker compose -f docker-compose.dev.yml exec app pytest tests/ --cov=src --cov-report=html

lint:
	docker compose -f docker-compose.dev.yml exec app black src/
	docker compose -f docker-compose.dev.yml exec app flake8 src/
	docker compose -f docker-compose.dev.yml exec app mypy src/

build:
	docker build -t luxoranova/ai-coding:latest ./ai-coding

push:
	docker push luxoranova/ai-coding:latest

clean:
	docker system prune -af
	docker volume prune -f

db-shell:
	docker compose -f docker-compose.dev.yml exec postgres psql -U dev -d luxor9

redis-cli:
	docker compose -f docker-compose.dev.yml exec redis redis-cli
```

---

## <a name="security"></a>8. SECURITY & HARDENING BLUEPRINT

### 8.1 Docker Hardened Images (DHI) Integration

**Migrate to DHI:**
```bash
# Current: python:3.11-slim
# Migrate to: dhi/pkg-python:3.11-slim-alpine

# Check available DHI images
docker search dhi/pkg-
```

**Updated AI Coding Dockerfile with DHI:**
```dockerfile
FROM dhi/pkg-python:3.11-slim-alpine as builder
WORKDIR /build
COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

FROM dhi/pkg-python:3.11-slim-alpine
RUN addgroup -g 1000 app && adduser -D -u 1000 -G app app
WORKDIR /app

COPY --from=builder --chown=app:app /root/.local /home/app/.local
ENV PATH=/home/app/.local/bin:$PATH
COPY --chown=app:app src/ ./src/

USER app
EXPOSE 8000
CMD ["python", "-m", "uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 8.2 Secrets Management

**Using Docker Secrets (Swarm):**
```bash
# Create secrets
echo "SecureDBPassword123!" | docker secret create db_password -
echo "EncryptionKey$(openssl rand -base64 32)" | docker secret create n8n_key -

# Reference in compose
services:
  app:
    secrets:
      - db_password
      - n8n_key
    environment:
      DB_PASSWORD_FILE: /run/secrets/db_password
```

**Using Pass Secrets Manager (Docker Pass):**
```bash
# Install plugin
docker pull docker/pass

# Store secrets
docker pass store mysecret "SecurePassword123!"

# Use in compose
environment:
  - DB_PASSWORD=${PASS_DB_PASSWORD}
```

**Using .env File (Development Only):**
```env
# .env (never commit to git)
DB_PASSWORD=DevPassword123
ENCRYPTION_KEY=GeneratedKeyHere
```

**.gitignore**
```
.env
.env.local
.env.*.local
*.pem
*.key
secrets/
```

### 8.3 Network Security

**Compose Network Isolation:**
```yaml
networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge
    internal: true  # No external access

services:
  nginx:
    networks:
      - frontend
  
  api:
    networks:
      - frontend
      - backend
  
  db:
    networks:
      - backend  # Only accessible from API
```

### 8.4 Image Scanning & Vulnerability Management

```bash
# Scout scan (built-in)
docker scout cves luxoranova/ai-coding:latest

# Trivy scan (free)
trivy image luxoranova/ai-coding:latest

# GitHub security
# Enable Dependabot in repo settings
# Configure branch protection rules
```

### 8.5 Container Runtime Security

**seccomp Profile:**
```json
{
  "defaultAction": "SCMP_ACT_ERRNO",
  "defaultErrnoRet": 1,
  "archMap": [
    {
      "architecture": "SCMP_ARCH_X86_64",
      "subArchitectures": ["SCMP_ARCH_X86", "SCMP_ARCH_X32"]
    }
  ],
  "syscalls": [
    {
      "names": ["accept4", "arch_prctl", "bind", "brk"],
      "action": "SCMP_ACT_ALLOW"
    }
  ]
}
```

**Docker Compose with Security:**
```yaml
services:
  app:
    security_opt:
      - no-new-privileges:true
      - seccomp:unconfined  # Or custom profile
    cap_drop:
      - ALL
    cap_add:
      - NET_BIND_SERVICE
    read_only: true
    tmpfs:
      - /tmp
      - /run
```

---

## <a name="monitoring"></a>9. MONITORING & OBSERVABILITY BLUEPRINT

### 9.1 Prometheus Configuration

**File: monitoring/prometheus.yml**
```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s
  external_labels:
    monitor: 'docker-blueprint'

scrape_configs:
  - job_name: 'docker'
    static_configs:
      - targets: ['localhost:9323']

  - job_name: 'n8n'
    static_configs:
      - targets: ['n8n:5678']
    metrics_path: '/metrics'

  - job_name: 'ai-api'
    static_configs:
      - targets: ['ai-api:8000']
    metrics_path: '/metrics'

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres:5432']
    relabel_configs:
      - source_labels: [__address__]
        target_label: __param_target
      - source_labels: [__param_target]
        target_label: instance
      - target_label: __address__
        replacement: postgres-exporter:9187

  - job_name: 'redis'
    static_configs:
      - targets: ['redis:6379']
```

### 9.2 Grafana Dashboards

**Import these dashboard IDs:**
- 1860: Node Exporter
- 3662: Prometheus
- 6417: PostgreSQL
- 11114: Redis

### 9.3 Application Metrics (Python)

**File: src/metrics.py**
```python
from prometheus_client import Counter, Histogram, Gauge
import time

request_count = Counter(
    'app_requests_total',
    'Total requests',
    ['method', 'endpoint', 'status']
)

request_latency = Histogram(
    'app_request_latency_seconds',
    'Request latency',
    ['method', 'endpoint']
)

active_connections = Gauge(
    'app_active_connections',
    'Active database connections'
)

def track_request(method, endpoint):
    def decorator(func):
        def wrapper(*args, **kwargs):
            start = time.time()
            try:
                result = func(*args, **kwargs)
                status = 200
                return result
            except Exception as e:
                status = 500
                raise
            finally:
                duration = time.time() - start
                request_latency.labels(method=method, endpoint=endpoint).observe(duration)
                request_count.labels(method=method, endpoint=endpoint, status=status).inc()
        return wrapper
    return decorator
```

### 9.4 Logging Stack

**Docker Compose with ELK Stack:**
```yaml
elasticsearch:
  image: docker.elastic.co/elasticsearch/elasticsearch:8.0.0
  environment:
    - discovery.type=single-node
    - xpack.security.enabled=false
  volumes:
    - elasticsearch-data:/usr/share/elasticsearch/data

kibana:
  image: docker.elastic.co/kibana/kibana:8.0.0
  ports:
    - "5601:5601"
  depends_on:
    - elasticsearch

logstash:
  image: docker.elastic.co/logstash/logstash:8.0.0
  volumes:
    - ./monitoring/logstash.conf:/usr/share/logstash/pipeline/logstash.conf
  depends_on:
    - elasticsearch

# Application sends logs to logstash
app:
  logging:
    driver: "json-file"
    options:
      max-size: "10m"
      max-file: "3"
```

### 9.5 Health Checks & Alerting

**Alert Rules (alert.yml):**
```yaml
groups:
  - name: app_alerts
    rules:
      - alert: HighErrorRate
        expr: rate(app_requests_total{status="500"}[5m]) > 0.05
        for: 5m
        annotations:
          summary: "High error rate detected"

      - alert: PostgresDown
        expr: pg_up == 0
        for: 1m
        annotations:
          summary: "PostgreSQL is down"

      - alert: HighMemoryUsage
        expr: container_memory_usage_bytes / container_spec_memory_limit_bytes > 0.9
        for: 5m
        annotations:
          summary: "Container memory usage > 90%"
```

---

## <a name="action-plan"></a>10. ACTION PLAN & NEXT STEPS

### 📌 PHASE 1: IMMEDIATE (This Week)

**Priority 1 - Cleanup & Optimization**
```bash
# 1. Clean unused images (free 2.7GB)
docker image prune -a --force

# 2. Remove stopped containers
docker container prune --force

# 3. Verify cleanup
docker system df
```

**Priority 2 - Create File Structure**
```bash
# Clone/Create project directories
mkdir -p luxor9-ai-coding/{src,tests,.github/workflows}
mkdir -p luxor9-n8n/{config,workflows}

# Copy Dockerfiles from blueprints above
# Copy docker-compose files from blueprints above
```

**Priority 3 - Setup Version Control**
```bash
# Initialize git repos
cd luxor9-ai-coding
git init
git add .
git commit -m "Initial commit: Docker blueprints"
git remote add origin https://github.com/luxoranova/luxor9-ai-coding.git
git push -u origin main
```

### 📌 PHASE 2: BUILD & DEPLOY (Week 2-3)

**Priority 4 - Build Development Environment**
```bash
# Build dev image
docker compose -f docker-compose.dev.yml build

# Test hot reload
docker compose -f docker-compose.dev.yml up

# Run tests
docker compose -f docker-compose.dev.yml exec app pytest tests/
```

**Priority 5 - Setup CI/CD Pipeline**
- Add GitHub Actions workflow files (from Section 5)
- Configure Docker Hub secrets
- Configure deployment secrets (SSH, etc.)
- Test workflow triggers on push/PR

**Priority 6 - Production Deployment Prep**
- Set up server infrastructure (VM, managed service, etc.)
- Configure domain and SSL/TLS
- Set up environment variables
- Create deployment ansible playbook (optional)

### 📌 PHASE 3: PRODUCTION (Week 4+)

**Priority 7 - Deploy N8N Production**
```bash
# Prepare server
ssh user@server
docker compose -f docker-compose.prod.yml up -d

# Verify services
docker compose ps
docker compose logs -f n8n
```

**Priority 8 - Deploy AI Coding Production**
```bash
# Build and push image
docker build -t luxoranova/ai-coding:v1.0.0 ./ai-coding
docker push luxoranova/ai-coding:v1.0.0

# Deploy
docker compose up -d ai-api
```

**Priority 9 - Setup Monitoring**
- Deploy Prometheus + Grafana
- Import dashboards
- Configure alerts
- Test alerting

**Priority 10 - Security Hardening**
- Migrate to DHI images
- Enable secret management
- Configure network isolation
- Run vulnerability scans
- Setup log aggregation

### 📊 METRICS & SUCCESS CRITERIA

| Metric | Current | Target | Timeline |
|--------|---------|--------|----------|
| Image size (N8N) | 2.47GB | 1.2GB | Week 2 |
| Build time | - | < 5min | Week 2 |
| Test coverage | - | > 80% | Week 3 |
| Deployment time | - | < 2min | Week 3 |
| Uptime | - | 99.9% | Week 4 |
| Error rate | - | < 0.1% | Week 4 |

---

## 🚀 QUICK START COMMANDS

```bash
# Clone blueprints
git clone https://github.com/luxoranova/docker-blueprint.git
cd docker-blueprint

# Development
make dev              # Start dev environment
make test            # Run tests
make lint            # Run linters
make build           # Build production image
make push            # Push to registry

# Production (Assuming deployment setup)
docker-compose up -d              # Start stack
docker-compose logs -f app        # View logs
docker-compose ps                 # Check status
docker-compose exec app bash      # Access container

# Monitoring
# Access Grafana: http://localhost:3000 (admin/password)
# Access Prometheus: http://localhost:9090
# Access Kibana: http://localhost:5601
```

---

## 📚 RESOURCES & DOCUMENTATION

### Official Documentation
- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Docker Security](https://docs.docker.com/engine/security/)

### Tools & Platforms
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Docker Hub](https://hub.docker.com/)
- [Docker Build Cloud](https://www.docker.com/products/docker-build-cloud/)
- [GitHub Actions](https://github.com/features/actions)

### Community & Support
- [Docker Community Slack](https://www.docker.com/docker-community)
- [Docker Forums](https://forums.docker.com/)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/docker)

---

## 📝 NOTES

- All credentials should be stored securely using secrets management
- Always use multi-stage builds for production images
- Monitor resource usage and adjust limits as needed
- Regularly scan images for vulnerabilities
- Keep base images updated monthly
- Test changes in development before production deployment
- Maintain detailed runbooks for operations team
- Document all customizations and modifications

---

**Last Updated:** 2026-06-19
**Author:** Gordon (Docker AI Assistant)
**Status:** Complete Blueprint Ready for Implementation
