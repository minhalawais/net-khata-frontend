# WhatsApp Module Deployment Guide - Hostinger VPS

**Date:** March 31, 2026  
**Status:** Production Ready  
**Timezone:** Asia/Karachi (All operations timezone-aware)

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Architecture Overview](#architecture-overview)
3. [Step-by-Step Deployment](#step-by-step-deployment)
4. [Configuration Setup](#configuration-setup)
5. [Running Evolution API](#running-evolution-api)
6. [Flask Integration](#flask-integration)
7. [Network & Firewall Setup](#network--firewall-setup)
8. [Monitoring & Maintenance](#monitoring--maintenance)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Verify you have these installed on Hostinger VPS:
```bash
# Check Docker
docker --version        # Output: Docker version 20.10+

# Check Docker Compose
docker-compose --version  # Output: docker-compose version 1.29+

# Check Python (for Flask)
python3 --version       # Output: Python 3.8+

# Check PostgreSQL client (optional, for DB management)
psql --version
```

**If missing, install:**
```bash
# Update packages
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
newgrp docker

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.3.3/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    HOSTINGER VPS                            │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────┐         ┌──────────────────────────┐ │
│  │  Flask Backend   │         │  React Frontend          │ │
│  │  (Port 5000)     │         │  (Port 3000/80/443)      │ │
│  │                  │         │                          │ │
│  │  Already Running │         │  Already Running         │ │
│  └────────┬─────────┘         └──────────────────────────┘ │
│           │                                                  │
│           │ API Calls to /api/whatsapp/*                    │
│           │                                                  │
│     ┌─────▼──────────────────────────────────┐             │
│     │   WhatsApp Message Queue Processing    │             │
│     │   (whatsapp_dispatcher.py)             │             │
│     │   Runs as background thread in Flask   │             │
│     └──────────┬──────────────────────────────┘             │
│                │                                             │
│                │ HTTP Calls (instance_token auth)           │
│                │                                             │
│  ┌─────────────▼──────────────────────────────────────────┐│
│  │         Docker Container Network                       ││
│  │  (docker-compose.evolution.yml)                        ││
│  │                                                         ││
│  │  ┌────────────────────┐    ┌─────────────────────────┐││
│  │  │  Evolution API     │    │  Redis Cache            │││
│  │  │  v2.2.3 (Port 8081)│───→│  (Port 6379 internal)   │││
│  │  │                    │    │                         │││
│  │  │  WhatsApp Gateway  │    │  Message queue data     │││
│  │  │  (Baileys)         │    │  Instance cache         │││
│  │  └────────────────────┘    └─────────────────────────┘││
│  │                                                         ││
│  │  Volumes:  /evolution/instances (QR, session data)    ││
│  └──────────────┬──────────────────────────────────────────┘│
│                │                                             │
│  ┌─────────────▼────────────────────────────────────┐      │
│  │   PostgreSQL Database                            │      │
│  │   (Already running - external or local)          │      │
│  │                                                   │      │
│  │   - whatsapp_config (settings per company)      │      │
│  │   - whatsapp_message_queue (pending messages)   │      │
│  │   - whatsapp_daily_quota (rate limits)          │      │
│  │   - evolution webhook events (QR, delivery)     │      │
│  └───────────────────────────────────────────────────┘      │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Step-by-Step Deployment

### Step 1: Create Project Directory Structure

```bash
# SSH into your Hostinger VPS
ssh user@your-vps-ip

# Navigate to project root
cd /home/youruser/netkhata  # or wherever your Flask app is

# Verify structure
ls -la
# Expected output:
# drwxr-xr-x  api/             (Flask backend)
# drwxr-xr-x  src/             (React frontend)
# -rw-r--r--  docker-compose.evolution.yml
# -rw-r--r--  .env.evolution
# -rw-r--r--  package.json
# drwxr-xr-x  build/           (React production build)
```

### Step 2: Configure Environment Files

**Create `.env.evolution` file:**

```bash
cat > .env.evolution << 'EOF'
# ============================================================
# Evolution API Environment Configuration - HOSTINGER PRODUCTION
# ============================================================

# ------ Server ------
# CRITICAL: Replace YOUR_HOSTINGER_IP with your actual VPS IP
# This is the URL that webhooks and frontend will use to reach Evolution API
SERVER_URL=http://YOUR_HOSTINGER_IP:8081
SERVER_PORT=8080

# ------ Authentication ------
# IMPORTANT: Change this to a STRONG random secret
# Must match EVOLUTION_API_KEY in your Flask .env
AUTHENTICATION_API_KEY=netkhata_evolution_key_CHANGE_THIS_$(openssl rand -hex 16)
AUTHENTICATION_EXPOSE_IN_FETCH_INSTANCES=false

# ------ Database (PostgreSQL) ------
# Point to your existing PostgreSQL database
DATABASE_ENABLED=true
DATABASE_PROVIDER=postgresql
# Use your actual database credentials
DATABASE_CONNECTION_URI=postgresql://postgres:YOUR_DB_PASSWORD@YOUR_DB_HOST:5432/isp_management?schema=evolution
DATABASE_CONNECTION_CLIENT_NAME=evolution_api

# ------ Cache (Redis) ------
# Redis runs in Docker container alongside Evolution
CACHE_REDIS_ENABLED=true
CACHE_REDIS_URI=redis://redis:6379/0
CACHE_REDIS_PREFIX_KEY=evolution
CACHE_REDIS_SAVE_INSTANCES=true
CACHE_LOCAL_ENABLED=false

# ------ Instance Settings ------
CONFIG_SESSION_PHONE_CLIENT=Net Khata
CONFIG_SESSION_PHONE_NAME=Chrome
CONFIG_SESSION_PHONE_VERSION=2.3000.1036214631
WEB_VERSION=2.3000.1036214631

# ------ Webhook ------
# CRITICAL: This is where Evolution sends QR updates and message receipts
# Must be reachable from Evolution container (localhost won't work!)
WEBHOOK_GLOBAL_ENABLED=true
WEBHOOK_GLOBAL_URL=http://YOUR_HOSTINGER_IP:5000/api/whatsapp/webhook
WEBHOOK_GLOBAL_WEBHOOK_BY_EVENTS=true

# Events to receive
WEBHOOK_EVENTS_MESSAGES_UPDATE=true      # Delivery receipts (sent/delivered/read)
WEBHOOK_EVENTS_CONNECTION_UPDATE=true    # Phone connected/disconnected state
WEBHOOK_EVENTS_QRCODE_UPDATED=true       # QR code refresh (every ~20s)
WEBHOOK_EVENTS_MESSAGES_UPSERT=false     # Not needed
WEBHOOK_EVENTS_SEND_MESSAGE=false        # Not needed

# ------ QR Code ------
QRCODE_LIMIT=30
QRCODE_COLOR=#198754

# ------ Logging ------
LOG_LEVEL=WARN
LOG_COLOR=true
LOG_BAILEYS=error
EOF
```

**Update your Flask `.env` file:**
```bash
# Add/update these lines in your existing Flask .env
EVOLUTION_API_URL=http://localhost:8081
EVOLUTION_API_KEY=netkhata_evolution_key_CHANGE_THIS_[same as above]

# Database timezone (must be Asia/Karachi for SQL operations)
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/isp_management
SQLALCHEMY_ECHO=false

# Flask settings
FLASK_ENV=production
DEBUG=False
WORKERS=4

# Frontend URL (for invoice links in WhatsApp messages)
FRONTEND_URL=http://YOUR_HOSTINGER_IP:3000
# or if using domain:
FRONTEND_URL=https://yourdomain.com
```

**Generate secure API key:**
```bash
# Generate a strong random key
openssl rand -hex 32
# Output: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6...

# Use this value for both:
# - AUTHENTICATION_API_KEY in .env.evolution
# - EVOLUTION_API_KEY in Flask .env
```

### Step 3: Update docker-compose Configuration

The provided `docker-compose.evolution.yml` is almost ready, but adjust it for Hostinger:

```bash
cat > docker-compose.evolution.yml << 'EOF'
# ============================================================
# Evolution API - WhatsApp Gateway for Hostinger VPS
# ============================================================

version: '3.8'

services:
  evolution-api:
    container_name: evolution-api
    image: atendai/evolution-api:v2.2.3
    restart: unless-stopped
    
    # Port mapping: container port 8080 → host port 8081
    ports:
      - "8081:8080"
    
    # Load environment variables
    env_file:
      - .env.evolution
    
    # Volume for persistent instance data and sessions
    volumes:
      - evolution_instances:/evolution/instances
      - ./logs/evolution:/var/log/evolution  # Optional: persist logs
    
    # Depends on Redis for caching
    depends_on:
      redis:
        condition: service_healthy
    
    # Network: connects to same Docker network as Flask (if using Docker)
    # Or standalone network if Flask is on host machine
    networks:
      - evolution-net
    
    # Health check
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    
    # Resource limits (adjust based on your VPS)
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
    
    # Logging
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  redis:
    container_name: evolution-redis
    image: redis:7-alpine
    restart: unless-stopped
    
    # Redis command with persistence and memory limits
    command: redis-server --appendonly yes --maxmemory 256mb --maxmemory-policy allkeys-lru
    
    # Volume for Redis data persistence
    volumes:
      - redis_data:/data
    
    # Health check
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 3
    
    networks:
      - evolution-net
    
    # Resource limits
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M

# Named volumes for persistence
volumes:
  evolution_instances:
    driver: local
  redis_data:
    driver: local

# Network for Docker services
networks:
  evolution-net:
    driver: bridge
EOF
```

### Step 4: Create Required Directories

```bash
# Create logs directory for Evolution API
mkdir -p logs/evolution

# Set permissions
chmod 755 logs/evolution

# Verify
ls -la logs/
```

### Step 5: Start Evolution API Container

```bash
# Build and start containers in background
docker-compose -f docker-compose.evolution.yml up -d

# Wait for containers to start (30-40 seconds)
sleep 40

# Verify containers are running
docker-compose -f docker-compose.evolution.yml ps

# Expected output:
# NAME              COMMAND                  SERVICE       STATUS       PORTS
# evolution-api     "node dist/main.js"      evolution-api  Up 30s       0.0.0.0:8081->8080/tcp
# evolution-redis   "redis-server ..."       redis         Up 30s (healthy)
```

### Step 6: Test Evolution API Connectivity

```bash
# Test from VPS
curl -X GET http://localhost:8081/health \
  -H "apikey: netkhata_evolution_key_CHANGE_THIS_..."

# Expected output:
# {"status":"ok"}

# Test from your local machine (or through Flask)
curl -X GET http://YOUR_HOSTINGER_IP:8081/health \
  -H "apikey: netkhata_evolution_key_CHANGE_THIS_..."
```

---

## Configuration Setup

### Update Flask to Enable WhatsApp Dispatcher

Edit your Flask `run.py` or `app/__init__.py`:

```python
from app.services.whatsapp_dispatcher import init_dispatcher

def create_app(config_name='development'):
    app = Flask(__name__)
    
    # ... existing Flask setup code ...
    
    # Initialize WhatsApp Dispatcher (background thread)
    if not app.debug or os.environ.get('WERKZEUG_RUN_MAIN') == 'true':
        init_dispatcher(app)
        app.logger.info("✅ WhatsApp Dispatcher initialized")
    
    return app
```

**In your `run.py` (if running directly):**

```python
if __name__ == "__main__":
    app = create_app()
    
    # Run with production server (Gunicorn)
    # DO NOT use Flask development server in production
    app.run(host='127.0.0.1', port=5000)
```

### Configure Gunicorn for Flask (Production)

```bash
# Install Gunicorn
pip install gunicorn

# Create gunicorn config file
cat > /home/youruser/netkhata/gunicorn_config.py << 'EOF'
import multiprocessing

# Server socket
bind = "127.0.0.1:5000"
backlog = 2048

# Worker processes
workers = multiprocessing.cpu_count() * 2 + 1
worker_class = "sync"
worker_connections = 1000
timeout = 60
keepalive = 2

# Logging
accesslog = "/home/youruser/netkhata/logs/gunicorn_access.log"
errorlog = "/home/youruser/netkhata/logs/gunicorn_error.log"
loglevel = "info"

# Other
umask = 0o022
user_affinity = False
preload_app = False
daemon = False
EOF

# Create logs directory
mkdir -p /home/youruser/netkhata/logs
```

### Create Systemd Service (Auto-restart Flask)

```bash
# Create systemd service file
sudo cat > /etc/systemd/system/netkhata-flask.service << 'EOF'
[Unit]
Description=Net Khata Flask Backend
After=network.target postgresql.service

[Service]
Type=notify
User=youruser
Group=yourgroup
WorkingDirectory=/home/youruser/netkhata

# Environment variables
Environment="PATH=/home/youruser/netkhata/venv/bin"
Environment="FLASK_ENV=production"
Environment="FLASK_APP=api/run.py"

# Start Flask via Gunicorn
ExecStart=/home/youruser/netkhata/venv/bin/gunicorn \
    --config gunicorn_config.py \
    --bind 127.0.0.1:5000 \
    api.run:app

# Restart policy
Restart=always
RestartSec=10

# Output logging
StandardOutput=journal
StandardError=journal
SyslogIdentifier=netkhata-flask

[Install]
WantedBy=multi-user.target
EOF

# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable netkhata-flask.service
sudo systemctl start netkhata-flask.service

# Check status
sudo systemctl status netkhata-flask.service
```

### Create Systemd Service for Evolution (Docker)

```bash
sudo cat > /etc/systemd/system/netkhata-evolution.service << 'EOF'
[Unit]
Description=Net Khata Evolution API (Docker)
After=docker.service
Requires=docker.service

[Service]
Type=simple
User=youruser
Group=docker
WorkingDirectory=/home/youruser/netkhata

# Start Evolution Docker containers
ExecStart=/usr/local/bin/docker-compose -f docker-compose.evolution.yml up

# Stop services
ExecStop=/usr/local/bin/docker-compose -f docker-compose.evolution.yml down

# Restart policy
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Enable and start
sudo systemctl daemon-reload
sudo systemctl enable netkhata-evolution.service
sudo systemctl start netkhata-evolution.service

# Check status
sudo systemctl status netkhata-evolution.service
```

---

## Running Evolution API

### Start Services

**Option 1: Using Systemd (Recommended for Production)**
```bash
# Start Evolution API
sudo systemctl start netkhata-evolution.service

# Start Flask
sudo systemctl start netkhata-flask.service

# Check status
sudo systemctl status netkhata-evolution.service
sudo systemctl status netkhata-flask.service

# View logs
sudo journalctl -u netkhata-evolution.service -f
sudo journalctl -u netkhata-flask.service -f
```

**Option 2: Manual Docker Compose (for Testing)**
```bash
# Start containers
docker-compose -f docker-compose.evolution.yml up -d

# View logs
docker-compose -f docker-compose.evolution.yml logs -f evolution-api

# Stop containers
docker-compose -f docker-compose.evolution.yml down
```

### Verify All Services Running

```bash
# Check Flask
curl http://localhost:5000/health

# Check Evolution API
curl -H "apikey: YOUR_API_KEY" http://localhost:8081/health

# Check Docker containers
docker ps

# Expected output should show:
# - evolution-api (healthy)
# - evolution-redis (healthy)

# Check Flask logs
tail -f /home/youruser/netkhata/logs/gunicorn_error.log
```

---

## Network & Firewall Setup

### Configure Firewall (UFW)

```bash
# Enable UFW
sudo ufw enable

# Allow SSH
sudo ufw allow 22/tcp

# Allow Flask (internal only - don't expose to public)
sudo ufw allow from 127.0.0.1 to 127.0.0.1 port 5000

# Allow Evolution API (internal only)
sudo ufw allow from 127.0.0.1 to 127.0.0.1 port 8081

# Allow HTTP/HTTPS (for React frontend via Nginx)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Check rules
sudo ufw status

# Expected:
# 22/tcp    ALLOW    Anywhere
# 80/tcp    ALLOW    Anywhere
# 443/tcp   ALLOW    Anywhere
```

### Nginx Reverse Proxy Configuration

**Create Nginx config for WhatsApp webhook:**

```bash
sudo cat > /etc/nginx/sites-available/whatsapp-api << 'EOF'
upstream evolution_api {
    server 127.0.0.1:8081;
}

upstream flask_backend {
    server 127.0.0.1:5000;
}

server {
    listen 80;
    server_name YOUR_HOSTINGER_IP;

    # Webhook endpoint for Evolution API
    location /api/whatsapp/webhook {
        proxy_pass http://flask_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300s;
    }

    # WhatsApp API endpoints
    location /api/whatsapp {
        proxy_pass http://flask_backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_read_timeout 60s;
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/whatsapp-api /etc/nginx/sites-enabled/

# Test Nginx config
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

---

## Flask Integration

### Environment Variables Setup

Create `.env` in your Flask directory:

```bash
# Database
DATABASE_URL=postgresql://postgres:YOUR_DB_PASSWORD@localhost:5432/isp_management
SQLALCHEMY_ECHO=false

# Flask
FLASK_ENV=production
DEBUG=false
SECRET_KEY=your-secret-key-change-this-to-something-long-and-random

# WhatsApp / Evolution API
EVOLUTION_API_URL=http://localhost:8081
EVOLUTION_API_KEY=netkhata_evolution_key_CHANGE_THIS_...
EVOLUTION_API_TIMEOUT=30

# Frontend URL (for invoice links in WhatsApp messages)
FRONTEND_URL=https://yourdomain.com
# or IP-based:
# FRONTEND_URL=http://YOUR_HOSTINGER_IP:3000

# JWT
JWT_SECRET_KEY=your-jwt-secret-key-change-this

# Logging
LOG_LEVEL=INFO
LOG_FILE=/home/youruser/netkhata/logs/flask.log

# Scheduler (for daily invoice generation, quota reset)
SCHEDULER_ENABLED=true
```

### Database Initialization

```bash
# Ensure migrations are applied
cd /home/youruser/netkhata/api
flask db upgrade

# Check if Evolution tables exist
psql -h localhost -U postgres -d isp_management -c "\dt evolution_*"

# If tables missing, run initialization
python -c "from app import create_app, db; app = create_app(); app.app_context().push(); db.create_all()"
```

---

## Monitoring & Maintenance

### Monitor Services

```bash
# Real-time status
watch -n 5 'docker ps && ps aux | grep gunicorn'

# Check Evolution API logs
docker-compose -f docker-compose.evolution.yml logs -f evolution-api

# Check Redis health
docker-compose -f docker-compose.evolution.yml exec redis redis-cli info stats

# Check Flask logs
tail -f /home/youruser/netkhata/logs/gunicorn_error.log
```

### Database Backup

```bash
# Create backup script
cat > /home/youruser/netkhata/backup_db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/home/youruser/netkhata/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Backup database
pg_dump -h localhost -U postgres isp_management | gzip > $BACKUP_DIR/db_$TIMESTAMP.sql.gz

# Keep only last 7 days
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_DIR/db_$TIMESTAMP.sql.gz"
EOF

chmod +x /home/youruser/netkhata/backup_db.sh

# Add to cron (daily at 2 AM)
crontab -e
# Add line: 0 2 * * * /home/youruser/netkhata/backup_db.sh
```

### Monitor WhatsApp Queue

```bash
# Check pending messages
psql -h localhost -U postgres -d isp_management << 'EOF'
SELECT COUNT(*) as pending_messages 
FROM whatsapp_message_queue 
WHERE status = 'pending';

SELECT COUNT(*) as sent_today 
FROM whatsapp_message_queue 
WHERE status = 'sent' 
AND DATE(sent_at) = CURRENT_DATE;

SELECT company_id, messages_sent, quota_limit 
FROM whatsapp_daily_quota 
WHERE DATE(date) = CURRENT_DATE;
EOF
```

### View WhatsApp Dispatcher Logs

```bash
# From Flask logs
sudo journalctl -u netkhata-flask.service | grep "WhatsApp"

# Or from file
grep "WhatsApp" /home/youruser/netkhata/logs/gunicorn_error.log
```

---

## Troubleshooting

### Evolution API Won't Start

```bash
# Check Docker logs
docker-compose -f docker-compose.evolution.yml logs evolution-api

# Common issues:
# 1. Port 8081 already in use
sudo lsof -i :8081

# 2. Permission denied
chmod 755 /home/youruser/netkhata

# 3. Database connection error
# Verify DATABASE_CONNECTION_URI in .env.evolution

# Restart
docker-compose -f docker-compose.evolution.yml restart evolution-api
```

### WebHook Not Receiving Events

```bash
# Check webhook URL in .env.evolution
echo $WEBHOOK_GLOBAL_URL

# Test from Evolution container
docker-compose -f docker-compose.evolution.yml exec evolution-api \
  curl -X POST http://YOUR_HOSTINGER_IP:5000/api/whatsapp/webhook \
  -H "Content-Type: application/json" \
  -d '{"event":"test"}'

# Check Flask logs
tail -f /home/youruser/netkhata/logs/gunicorn_error.log | grep webhook

# Verify Nginx is not blocking
sudo nginx -T | grep whatsapp
```

### QR Code Not Displaying

```bash
# Check Evolution instance exists
docker-compose -f docker-compose.evolution.yml exec evolution-api \
  curl -H "apikey: YOUR_API_KEY" http://localhost:8080/instance/list

# Check database for QR
psql -h localhost -U postgres -d isp_management << 'EOF'
SELECT company_id, qr_code_base64, awaiting_qr_scan 
FROM whatsapp_config 
LIMIT 5;
EOF

# If empty, trigger QR refresh
curl -X POST http://YOUR_HOSTINGER_IP:5000/api/whatsapp/instance/create \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"company_id": "YOUR_COMPANY_UUID"}'
```

### Messages Not Sending

```bash
# Check queue has pending messages
psql -h localhost -U postgres -d isp_management << 'EOF'
SELECT id, company_id, status, message_content 
FROM whatsapp_message_queue 
WHERE status = 'pending' 
LIMIT 5;
EOF

# Check if dispatcher is running
ps aux | grep "whatsapp_dispatcher"

# Check disk space (quota limits)
docker exec evolution-api df -h /evolution/instances

# Check Flask error logs
sudo journalctl -u netkhata-flask.service -n 50
```

### High CPU/Memory Usage

```bash
# Check resource consumption
docker stats evolution-api evolution-redis

# If Evolution using too much memory, increase limits in docker-compose.yml:
# deploy:
#   resources:
#     limits:
#       memory: 3G

# Restart containers
docker-compose -f docker-compose.evolution.yml restart

# Check Redis memory
docker-compose -f docker-compose.evolution.yml exec redis redis-cli info memory
```

### Database Connection Issues

```bash
# Test database connection
psql -h localhost -U postgres -d isp_management -c "SELECT NOW();"

# Check if PostgreSQL is running
sudo systemctl status postgresql

# Verify Flask can connect
python3 << 'EOF'
from app import create_app
app = create_app()
with app.app_context():
    from app import db
    result = db.session.execute("SELECT 1")
    print("✅ Database connection working")
EOF
```

---

## Production Checklist

Before going live, ensure:

- [ ] Evolution API Docker containers running and healthy
- [ ] Flask backend running via Gunicorn with systemd
- [ ] React frontend built and served via Nginx
- [ ] PostgreSQL database configured with Evolution schema
- [ ] `.env.evolution` and Flask `.env` configured with correct IPs/keys
- [ ] Webhook URL points to correct Hostinger IP
- [ ] Firewall allows only necessary ports (80, 443 public; 5000, 8081 internal)
- [ ] SSL certificates installed for HTTPS (Let's Encrypt recommended)
- [ ] Timezone set to Asia/Karachi on VPS: `sudo timedatectl set-timezone Asia/Karachi`
- [ ] Backup scripts configured and tested
- [ ] Monitoring/alerting configured
- [ ] WhatsApp Dispatcher background thread starting with Flask
- [ ] All timezone-aware datetime operations verified (completed in deployment)

---

## Summary

Your WhatsApp module architecture on Hostinger:

1. **Evolution API** (Docker): Handles WhatsApp connection via Baileys library
2. **Redis** (Docker): Caches instance data and message queue state
3. **Flask Backend**: Processes API calls, manages WhatsApp queue, runs dispatcher background thread
4. **PostgreSQL**: Stores configurations, messages, and quota tracking
5. **React Frontend**: User interface for managing WhatsApp settings

All components are timezone-aware (Asia/Karachi) and production-ready for deployment.

