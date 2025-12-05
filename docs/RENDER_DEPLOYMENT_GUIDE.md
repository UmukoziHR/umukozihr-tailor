# UmukoziHR Resume Tailor - Render Deployment Guide

## Overview

This guide will help you deploy the UmukoziHR Resume Tailor to Render with both staging and production environments.

## Architecture

- **Production API**: `umukozihr-tailor-api` (from `main` branch)
- **Staging API**: `umukozihr-tailor-api-staging` (from `dev` branch)
- **Databases**: PostgreSQL (production and staging)
- **Cache**: Redis (production and staging)

## Deployment Steps

### 1. Prerequisites

- GitHub repository connected to Render
- Gemini API key from Google AI Studio
- Render account (free tier works fine)

### 2. Initial Setup

#### A. Connect GitHub Repository

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Blueprint"
3. Connect your GitHub repository
4. Render will detect the `render.yaml` file

#### B. Create Redis Instances Manually

Since Redis is not fully supported in render.yaml for free tier, create these manually:

1. Go to Render Dashboard
2. Click "New +" → "Redis"
3. Create two instances:
   - Name: `umukozihr-redis-production`
   - Name: `umukozihr-redis-staging`
4. Select the free plan for both
5. Copy the connection strings for later use

### 3. Configure Environment Variables

#### Production API (`umukozihr-tailor-api`)

Go to the service settings and add these environment variables:

```env
ENVIRONMENT=production
LOG_LEVEL=INFO
GEMINI_API_KEY=<your-gemini-api-key>
SECRET_KEY=<generate-a-secure-32-char-key>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
ALLOWED_ORIGINS=https://your-frontend.com,https://www.your-frontend.com
SELF_PING_ENABLED=true
RENDER_EXTERNAL_URL=https://umukozihr-tailor-api.onrender.com
```

**Note**: `DATABASE_URL` and `REDIS_URL` should be auto-populated from connected services.

#### Staging API (`umukozihr-tailor-api-staging`)

```env
ENVIRONMENT=staging
LOG_LEVEL=DEBUG
GEMINI_API_KEY=<your-gemini-api-key>
SECRET_KEY=<generate-a-secure-32-char-key>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
ALLOWED_ORIGINS=https://your-staging-frontend.com,http://localhost:3000
SELF_PING_ENABLED=true
RENDER_EXTERNAL_URL=https://umukozihr-tailor-api-staging.onrender.com
```

### 4. Generate Secure Keys

#### SECRET_KEY

Generate a secure secret key using Python:

```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

Use this for the `SECRET_KEY` environment variable.

### 5. Deploy Services

#### Initial Deployment

1. Render will automatically deploy when you push to `main` (production) or `dev` (staging)
2. Monitor the build logs in the Render dashboard
3. Wait for the health check to pass

#### Manual Deploy

You can also manually deploy:

1. Go to the service in Render dashboard
2. Click "Manual Deploy" → "Deploy latest commit"

### 6. Database Migrations

After the first deployment, run migrations:

1. Go to Render dashboard → Your service
2. Open the "Shell" tab
3. Run:

```bash
cd server
python -c "from app.db.database import engine; from app.db.models import Base; Base.metadata.create_all(bind=engine)"
```

Or create a migration script and run it.

### 7. Verify Deployment

#### Test Health Endpoint

```bash
# Production
curl https://umukozihr-tailor-api.onrender.com/health

# Staging
curl https://umukozihr-tailor-api-staging.onrender.com/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "umukozihrtailor-backend"
}
```

#### Test Authentication

```bash
# Signup
curl -X POST https://umukozihr-tailor-api.onrender.com/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "testpass123"}'

# Login
curl -X POST https://umukozihr-tailor-api.onrender.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "testpass123"}'
```

### 8. Auto-Ping Feature

The API includes an auto-ping feature that prevents Render free tier services from sleeping:

- Pings every 4 minutes (240 seconds)
- Controlled by `SELF_PING_ENABLED` environment variable
- Uses `RENDER_EXTERNAL_URL` to ping itself
- Logs each ping attempt

To disable:
```env
SELF_PING_ENABLED=false
```

## Workflow

### Development Workflow

1. **Feature Development**
   ```bash
   git checkout dev
   git pull origin dev
   git checkout -b feature/my-feature
   # Make changes
   git commit -m "feat: add my feature"
   git push origin feature/my-feature
   ```

2. **Merge to Staging**
   ```bash
   git checkout dev
   git merge feature/my-feature
   git push origin dev
   ```
   - This automatically deploys to `umukozihr-tailor-api-staging`

3. **Test on Staging**
   - Run manual tests
   - Check logs in Render dashboard
   - Verify all features work

4. **Promote to Production**
   ```bash
   git checkout main
   git merge dev
   git push origin main
   ```
   - This automatically deploys to `umukozihr-tailor-api`

## Monitoring

### View Logs

1. Go to Render Dashboard
2. Select your service
3. Click "Logs" tab
4. Filter by severity (Info, Warning, Error)

### Health Monitoring

- Render automatically monitors the `/health` endpoint
- If it fails, the service will be restarted
- Check the "Events" tab for restart history

### Metrics

Render provides:
- CPU usage
- Memory usage
- Request count
- Response time

Access these in the "Metrics" tab.

## Troubleshooting

### Service Won't Start

1. Check build logs for dependency issues
2. Verify all environment variables are set
3. Check that `DATABASE_URL` and `REDIS_URL` are connected

### Database Connection Errors

1. Verify PostgreSQL service is running
2. Check that `DATABASE_URL` format is correct
3. Ensure database migrations have run

### Self-Ping Not Working

1. Check logs for ping errors
2. Verify `RENDER_EXTERNAL_URL` is correct
3. Ensure `SELF_PING_ENABLED=true`

### CORS Errors

1. Check `ALLOWED_ORIGINS` includes your frontend URL
2. Ensure URLs don't have trailing slashes
3. Verify protocol (http vs https)

## Cost Optimization

### Free Tier Limits

- **Web Services**: 750 hours/month (1 instance)
- **PostgreSQL**: 90 days retention, 1GB storage
- **Redis**: 25MB storage

### Recommendations

1. Use the same Gemini API key for both environments
2. Share Redis instances if not performance-critical
3. Monitor usage in Render dashboard
4. Clean up old artifacts and logs

## Security Checklist

- [ ] `SECRET_KEY` is at least 32 characters
- [ ] `GEMINI_API_KEY` is not in git history
- [ ] `ALLOWED_ORIGINS` only includes trusted domains
- [ ] Database credentials are managed by Render
- [ ] HTTPS is enforced (Render does this automatically)
- [ ] Rate limiting is configured (add middleware if needed)

## Next Steps

1. **Add CI/CD**: Set up GitHub Actions for automated testing
2. **Monitoring**: Integrate with Datadog or New Relic
3. **Backups**: Set up automated database backups
4. **CDN**: Add CloudFlare for static assets
5. **Custom Domain**: Configure custom domains in Render

## Support

- Render Documentation: https://render.com/docs
- GitHub Issues: [Your repo]/issues
- Email: support@umukozihr.com

---

**Last Updated**: 2025-12-03
**Version**: 1.3
