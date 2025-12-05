# UmukoziHR Resume Tailor v1.3 - Deployment Guide

**Target:** Millions of Africans seeking employment
**Deployment Options:** Local Development | Cloud Production

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Docker & Docker Compose installed
- Git
- Gemini API key ([Get one here](https://aistudio.google.com/app/apikey))

### 1. Clone and Setup
```bash
cd c:\Users\Jason\Desktop\UmukoziHR\umukozihr-tailor

# Create environment file
copy .env.example .env

# Edit .env and add your Gemini API key
notepad .env
# Set: GEMINI_API_KEY=your-key-here
```

### 2. Start All Services with Docker Compose
```bash
# Pull and start all containers (PostgreSQL, Redis, API, Celery, LaTeX)
docker-compose up -d

# View logs
docker-compose logs -f

# Check services are healthy
docker-compose ps
```

### 3. Run Database Migrations
```bash
# Execute migrations inside the API container
docker-compose exec api python migrate.py
```

###4. Start Frontend (Separate Terminal)
```bash
cd client
pnpm install
pnpm dev
```

### 5. Access Application
- **Frontend:** http://localhost:3000
- **API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs
- **Health Check:** http://localhost:8000/health

---

## 🔧 Local Development (Without Docker)

If you prefer running services natively:

### Backend
```bash
cd server

# Install Python dependencies
pip install -r requirements.txt

# Set environment variables (or use .env file)
set GEMINI_API_KEY=your-key
set DATABASE_URL=sqlite:///./umukozihr.db
set REDIS_URL=redis://localhost:6379/0

# Run migrations
python migrate.py

# Start server
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend
```bash
cd client
pnpm install
pnpm dev
```

### Required Services
You still need Redis for background tasks:
```bash
docker run -d -p 6379:6379 redis:7-alpine
```

---

## ☁️ Production Deployment

### Option 1: Docker Compose (VPS/Dedicated Server)

**Step 1: Prepare Server**
```bash
# On your production server
ssh user@your-server.com

# Install Docker & Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Clone repository
git clone https://github.com/yourusername/umukozihr-tailor.git
cd umukozihr-tailor
```

**Step 2: Configure Production Environment**
```bash
# Create production .env
cp .env.example .env
nano .env
```

Set these **CRITICAL** variables:
```env
ENVIRONMENT=production
LOG_LEVEL=WARNING

# Database
POSTGRES_USER=umukozihr_prod
POSTGRES_PASSWORD=STRONG_PASSWORD_HERE_32_CHARS_MIN
POSTGRES_DB=umukozihr_prod

# Security
SECRET_KEY=GENERATE_WITH_openssl_rand_hex_32
GEMINI_API_KEY=your-production-gemini-key

# CORS
ALLOWED_ORIGINS=https://umukozihr.com,https://www.umukozihr.com

# Frontend
NEXT_PUBLIC_API_URL=https://api.umukozihr.com

# Optional: AWS S3
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
S3_BUCKET=umukozihr-production
```

**Step 3: Deploy**
```bash
# Build and start all services
docker-compose up -d --build

# Run migrations
docker-compose exec api python migrate.py

# Check logs
docker-compose logs -f api
```

**Step 4: Setup Reverse Proxy (Nginx)**
```nginx
# /etc/nginx/sites-available/umukozihr.com

# API Server
server {
    listen 80;
    server_name api.umukozihr.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Frontend
server {
    listen 80;
    server_name umukozihr.com www.umukozihr.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

**Step 5: SSL with Let's Encrypt**
```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get certificates
sudo certbot --nginx -d api.umukozihr.com
sudo certbot --nginx -d umukozihr.com -d www.umukozihr.com

# Auto-renewal is configured automatically
```

### Option 2: Cloud Platforms (AWS, GCP, Azure)

#### AWS Deployment (Recommended for Scale)

**Architecture:**
- **ECS/Fargate:** API + Celery containers
- **RDS PostgreSQL:** Database
- **ElastiCache Redis:** Queue & cache
- **S3:** Artifact storage
- **CloudFront:** CDN for frontend
- **Route 53:** DNS
- **ALB:** Load balancer

**Quick Setup with AWS:**
```bash
# Use the provided docker-compose.yml with AWS ECS
# Set environment variables in ECS Task Definitions

# Example AWS CLI deployment
aws ecs create-service \
  --cluster umukozihr-cluster \
  --service-name umukozihr-api \
  --task-definition umukozihr-api:1 \
  --desired-count 3 \
  --launch-type FARGATE
```

#### Vercel (Frontend Only)
```bash
cd client

# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variable in Vercel dashboard:
# NEXT_PUBLIC_API_URL=https://api.umukozihr.com
```

---

## 📊 Scaling for Millions of Users

### Database Optimization
```sql
-- Add indexes for common queries
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_runs_user_id ON runs(user_id);
CREATE INDEX idx_runs_created_at ON runs(created_at DESC);
```

### Redis Configuration
```bash
# redis.conf
maxmemory 4gb
maxmemory-policy allkeys-lru
```

### API Horizontal Scaling
```bash
# Scale API containers
docker-compose up -d --scale api=5 --scale celery-worker=10
```

### Load Balancer (HAProxy/Nginx)
```nginx
upstream api_backend {
    least_conn;
    server 10.0.1.10:8000;
    server 10.0.1.11:8000;
    server 10.0.1.12:8000;
}
```

---

## 🔒 Security Checklist

Before deploying to production:

- [ ] ✅ New Gemini API key generated (revoke old one)
- [ ] ✅ `.env` removed from git history
- [ ] ✅ Strong `SECRET_KEY` generated (32+ characters)
- [ ] ✅ Strong `POSTGRES_PASSWORD` set
- [ ] ✅ CORS origins set to production domains only
- [ ] ✅ HTTPS/TLS enabled with valid certificate
- [ ] ✅ Firewall configured (only 80, 443, 22 open)
- [ ] ✅ Database backups configured
- [ ] ✅ Monitoring and alerting setup
- [ ] ✅ Rate limiting enabled
- [ ] ✅ Log aggregation configured

---

## 🧪 Testing Before Production

```bash
# Run backend tests
cd server
python -m pytest tests/ -v --cov=app

# Load testing with Locust
pip install locust
locust -f tests/load_test.py --host http://localhost:8000

# Test health endpoints
curl http://localhost:8000/health
curl http://localhost:8000/ready
```

---

## 📈 Monitoring

### Health Checks
- **Liveness:** `GET /health` (basic check)
- **Readiness:** `GET /ready` (DB connectivity)

### Recommended Tools
- **APM:** New Relic, Datadog
- **Logging:** CloudWatch, Papertrail
- **Uptime:** Pingdom, UptimeRobot
- **Error Tracking:** Sentry

### Key Metrics to Monitor
- API response time (p50, p95, p99)
- Error rate by endpoint
- LLM success/failure rate
- Database connection pool usage
- Redis queue length
- Active users
- Documents generated per hour

---

## 🔄 Updates & Maintenance

### Deploying Updates
```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose up -d --build

# Run new migrations
docker-compose exec api python migrate.py
```

### Database Backups
```bash
# Automated backup (add to crontab)
0 2 * * * docker-compose exec -T postgres pg_dump -U umukozihr umukozihr_prod > backup_$(date +\%Y\%m\%d).sql

# Restore from backup
docker-compose exec -T postgres psql -U umukozihr umukozihr_prod < backup_20251102.sql
```

### Log Rotation
```yaml
# /etc/docker/daemon.json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

---

## 🐛 Troubleshooting

### API Won't Start
```bash
# Check logs
docker-compose logs api

# Common issues:
# 1. Database not ready -> Wait for postgres health check
# 2. GEMINI_API_KEY missing -> Set in .env
# 3. Port 8000 in use -> Change API_PORT in .env
```

### Generate Endpoint Returns 400
```bash
# Check backend logs for LLM response details
docker-compose logs -f api | grep "LLM"

# Common causes:
# 1. Gemini API key invalid
# 2. Network connectivity to Google AI
# 3. LLM safety filters blocking prompt
```

### Database Connection Errors
```bash
# Check PostgreSQL is healthy
docker-compose ps postgres

# Test connection
docker-compose exec postgres psql -U umukozihr -d umukozihr_prod -c "SELECT 1;"
```

---

## 🌍 Serving Millions of Africans

### Cost Optimization
- Use **caching** aggressively (Redis for profiles, LLM responses)
- Implement **tiered pricing**: Free tier (5 resumes/month), Paid (unlimited)
- Use **batch processing** during off-peak hours
- Optimize **LLM prompts** to reduce token usage

### Performance Tips
- Enable **CDN** for frontend (CloudFlare, CloudFront)
- Use **connection pooling** (already in docker-compose)
- Implement **lazy loading** for large lists
- Add **pagination** to all list endpoints

### Reliability
- **Multi-region deployment** for redundancy
- **Automated health checks** with auto-restart
- **Circuit breakers** for external APIs
- **Graceful degradation** (serve cached results if LLM fails)

---

## 📞 Support

**For "Cloud Guy" (DevOps Engineer):**
- All configuration is in `.env` file
- Docker Compose handles all dependencies
- Health checks at `/health` and `/ready`
- Logs are JSON formatted for aggregation
- Metrics exported for Prometheus (if configured)

**Environment Variables:**
- See `.env.example` for all available options
- **CRITICAL:** Set `GEMINI_API_KEY`, `SECRET_KEY`, `POSTGRES_PASSWORD`
- **CORS:** Set `ALLOWED_ORIGINS` to production domains
- **Database:** Set `DATABASE_URL` or individual POSTGRES_* vars

**Deployment is Simple:**
1. Copy `.env.example` to `.env`
2. Fill in production values
3. Run `docker-compose up -d`
4. Run `docker-compose exec api python migrate.py`
5. Done!

---

## ✅ Production Readiness Summary

**Completed:**
- ✅ Environment-based configuration (.env)
- ✅ Docker Compose for all services
- ✅ Health check endpoints
- ✅ Comprehensive logging
- ✅ Security hardening (.gitignore, no hardcoded secrets)
- ✅ Scalable architecture (PostgreSQL, Redis, Celery)

**Remaining (for production):**
- ⚠️ **Revoke exposed API key** and generate new one
- ⚠️ Generate strong `SECRET_KEY` for production
- ⚠️ Set up monitoring and alerting
- ⚠️ Configure automated backups
- ⚠️ Load testing (target: 1000 concurrent users)
- ⚠️ Set up CI/CD pipeline

**Estimated Time to Production:** 1-2 weeks after completing remaining tasks

---

**This application will change lives. Deploy it well, and millions of Africans will thank you.** 🌍
