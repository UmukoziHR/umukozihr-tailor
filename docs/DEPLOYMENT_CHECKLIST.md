# UmukoziHR Resume Tailor - Production Deployment Checklist

**Date**: 2025-12-03
**Version**: 1.3
**Target**: Render.com (Production + Staging)

## Executive Summary

Your UmukoziHR Resume Tailor application is now **production-ready** with the following enhancements:

- Auto-ping functionality to prevent Render free tier sleep (pings every 4 minutes)
- Dual environment setup (production `main` + staging `dev`)
- Comprehensive deployment configuration for Render
- Enhanced security and CORS configuration
- Complete documentation and deployment guides

## Branch Structure

```
main (production)
  └── Deploys to: umukozihr-tailor-api.onrender.com
  └── Database: umukozihr-db-production
  └── Redis: umukozihr-redis-production

dev (staging)
  └── Deploys to: umukozihr-tailor-api-staging.onrender.com
  └── Database: umukozihr-db-staging
  └── Redis: umukozihr-redis-staging
```

## Pre-Deployment Checklist

### 1. Environment Preparation

- [ ] **GitHub Repository**
  - [ ] Push `dev` branch to GitHub
  - [ ] Push `main` branch to GitHub
  - [ ] Verify both branches are up to date

- [ ] **API Keys & Secrets**
  - [ ] Get Google Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
  - [ ] Generate secure SECRET_KEY (run: `python -c "import secrets; print(secrets.token_urlsafe(32))"`)
  - [ ] Have your frontend domain URLs ready

### 2. Render Account Setup

- [ ] **Create/Login to Render Account**
  - [ ] Go to [render.com](https://render.com)
  - [ ] Sign up or log in
  - [ ] Connect your GitHub account

### 3. Database & Cache Setup

- [ ] **PostgreSQL Databases** (Created automatically via render.yaml)
  - [ ] `umukozihr-db-production` (auto-created)
  - [ ] `umukozihr-db-staging` (auto-created)

- [ ] **Redis Instances** (Manual creation required)
  - [ ] Create `umukozihr-redis-production`
    1. New + → Redis
    2. Name: `umukozihr-redis-production`
    3. Plan: Free
    4. Copy connection string
  - [ ] Create `umukozihr-redis-staging`
    1. New + → Redis
    2. Name: `umukozihr-redis-staging`
    3. Plan: Free
    4. Copy connection string

## Deployment Steps

### Step 1: Push Code to GitHub

```bash
# You're currently on branch: main
# First, push the dev branch
git push origin dev

# Then, push the main branch
git push origin main
```

### Step 2: Deploy to Render via Blueprint

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Blueprint"**
3. **Connect your repository**: `UmukoziHR/umukozihr-tailor`
4. Render will detect `render.yaml` automatically
5. Click **"Apply"**

Render will create:
- `umukozihr-tailor-api` (from `main` branch)
- `umukozihr-tailor-api-staging` (from `dev` branch)
- `umukozihr-db-production` (PostgreSQL)
- `umukozihr-db-staging` (PostgreSQL)

### Step 3: Create Redis Instances Manually

Since Redis isn't fully supported in render.yaml for free tier:

1. **Production Redis**:
   - New + → Redis
   - Name: `umukozihr-redis-production`
   - Plan: Free
   - Region: Oregon (same as services)
   - Click "Create Redis"

2. **Staging Redis**:
   - New + → Redis
   - Name: `umukozihr-redis-staging`
   - Plan: Free
   - Region: Oregon
   - Click "Create Redis"

3. **Link Redis to Services**:
   - Go to `umukozihr-tailor-api` service
   - Environment tab
   - Edit `REDIS_URL` → Select `umukozihr-redis-production` from dropdown
   - Repeat for `umukozihr-tailor-api-staging` with `umukozihr-redis-staging`

### Step 4: Configure Environment Variables

#### Production API (`umukozihr-tailor-api`)

Go to service → Environment tab, set:

```env
ENVIRONMENT=production
LOG_LEVEL=INFO
GEMINI_API_KEY=<your-gemini-api-key>
SECRET_KEY=<generate-32-char-key>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
ALLOWED_ORIGINS=https://your-frontend.com
SELF_PING_ENABLED=true
RENDER_EXTERNAL_URL=https://umukozihr-tailor-api.onrender.com
```

**Note**: `DATABASE_URL` and `REDIS_URL` should auto-populate from linked services.

#### Staging API (`umukozihr-tailor-api-staging`)

```env
ENVIRONMENT=staging
LOG_LEVEL=DEBUG
GEMINI_API_KEY=<your-gemini-api-key>
SECRET_KEY=<generate-32-char-key>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
ALLOWED_ORIGINS=https://staging.your-frontend.com,http://localhost:3000
SELF_PING_ENABLED=true
RENDER_EXTERNAL_URL=https://umukozihr-tailor-api-staging.onrender.com
```

### Step 5: Run Database Migrations

After first deployment, initialize databases:

1. **Staging Database**:
   - Go to `umukozihr-tailor-api-staging` in Render
   - Open **Shell** tab
   - Run:
     ```bash
     cd server
     python -c "from app.db.database import engine; from app.db.models import Base; Base.metadata.create_all(bind=engine)"
     ```

2. **Production Database**:
   - Go to `umukozihr-tailor-api` in Render
   - Open **Shell** tab
   - Run same command as above

### Step 6: Verify Deployment

#### Test Staging

```bash
# Health check
curl https://umukozihr-tailor-api-staging.onrender.com/health

# Expected: {"status":"healthy","service":"umukozihrtailor-backend"}

# Test signup
curl -X POST https://umukozihr-tailor-api-staging.onrender.com/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@staging.com","password":"test123"}'
```

#### Test Production

```bash
# Health check
curl https://umukozihr-tailor-api.onrender.com/health

# Test signup
curl -X POST https://umukozihr-tailor-api.onrender.com/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@production.com","password":"test123"}'
```

## Post-Deployment

### Monitor Services

1. **Check Logs**:
   - Render Dashboard → Your Service → Logs tab
   - Look for "Starting self-ping task" message
   - Verify "Self-ping successful" appears every 4 minutes

2. **Health Monitoring**:
   - Render automatically pings `/health` endpoint
   - Check Events tab for any restart events

3. **Metrics**:
   - CPU usage should be minimal (<5% idle)
   - Memory usage around 200-300MB
   - Response time <500ms

### Development Workflow

```bash
# Feature development
git checkout dev
git checkout -b feature/my-feature
# ... make changes ...
git commit -m "feat: my feature"
git push origin feature/my-feature

# Create PR to dev branch
# Test on staging: umukozihr-tailor-api-staging.onrender.com

# After testing, merge to main
git checkout main
git merge dev
git push origin main

# This triggers production deployment automatically
```

## Troubleshooting

### Service Won't Start

**Symptom**: Build fails or service crashes on startup

**Solutions**:
1. Check build logs for dependency errors
2. Verify Python version is 3.11
3. Check all environment variables are set
4. Ensure DATABASE_URL and REDIS_URL are connected

### Database Connection Errors

**Symptom**: `OperationalError: could not connect to server`

**Solutions**:
1. Verify PostgreSQL service is running
2. Check DATABASE_URL format
3. Run migrations in Shell tab
4. Check database region matches service region

### Self-Ping Not Working

**Symptom**: Service goes to sleep after 15 minutes

**Solutions**:
1. Check logs for "Self-ping successful" messages
2. Verify `SELF_PING_ENABLED=true`
3. Check `RENDER_EXTERNAL_URL` is correct
4. Ensure httpx is in requirements.txt (already added)

### CORS Errors on Frontend

**Symptom**: Browser console shows CORS errors

**Solutions**:
1. Add frontend domain to `ALLOWED_ORIGINS`
2. Remove trailing slashes from URLs
3. Verify protocol (https for production)
4. Check CORS middleware is loaded (check logs)

## Cost Monitoring

### Free Tier Limits (Render)

- **Web Services**: 750 hours/month per instance
- **PostgreSQL**: 90 days retention, 1GB storage
- **Redis**: 25MB storage

### Expected Usage (with auto-ping)

- **Both services running 24/7**: ~1440 hours/month (exceeds free tier for 2 services)
- **Recommendation**: Use paid tier ($7/month per service) or run only one environment

### Cost-Saving Options

1. **Disable auto-ping on staging** when not testing:
   ```env
   SELF_PING_ENABLED=false  # for staging only
   ```

2. **Suspend staging service** when not in use
3. **Upgrade to paid tier**: $7/month per service (no sleep)

## Security Checklist

- [ ] `SECRET_KEY` is at least 32 characters
- [ ] `GEMINI_API_KEY` is not in git history
- [ ] `.env` files are in `.gitignore`
- [ ] `ALLOWED_ORIGINS` only includes trusted domains
- [ ] Database passwords are managed by Render
- [ ] HTTPS is enforced (automatic on Render)

## Next Steps After Deployment

1. **Set up CI/CD**:
   - GitHub Actions for automated testing
   - Run tests before merging to main

2. **Add Monitoring**:
   - Integrate with Datadog or New Relic
   - Set up error tracking (Sentry)

3. **Performance Optimization**:
   - Add Redis caching for LLM responses
   - Implement request rate limiting

4. **Frontend Deployment**:
   - Deploy Next.js client to Vercel or Netlify
   - Update `ALLOWED_ORIGINS` with frontend URL

5. **Custom Domain** (optional):
   - Configure custom domain in Render
   - Update DNS settings

## Quick Reference

### Important URLs

| Service | URL |
|---------|-----|
| Production API | https://umukozihr-tailor-api.onrender.com |
| Staging API | https://umukozihr-tailor-api-staging.onrender.com |
| Health Check | `<service-url>/health` |
| API Docs | `<service-url>/docs` |

### Important Files

| File | Purpose |
|------|---------|
| `render.yaml` | Render deployment configuration |
| `RENDER_DEPLOYMENT_GUIDE.md` | Complete deployment guide |
| `server/.env.production.example` | Production env template |
| `server/.env.staging.example` | Staging env template |

### Support Resources

- [Render Documentation](https://render.com/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Google Gemini API Docs](https://ai.google.dev/docs)

---

## Summary

Your application is **ready for production deployment**. Follow the steps above to:

1. Push code to GitHub (dev + main branches)
2. Deploy to Render using Blueprint (render.yaml)
3. Create Redis instances manually
4. Configure environment variables
5. Run database migrations
6. Test both environments

The auto-ping feature will keep your services alive on Render's free tier, ensuring zero downtime for users.

**Estimated deployment time**: 30-45 minutes

Good luck with your launch! 🚀

---

**Prepared by**: Claude Code (Anthropic)
**Date**: 2025-12-03
**Version**: 1.3
