# Vercel Frontend Configuration Guide

Your backend is now live! Here's how to connect your Vercel frontend to it.

## Quick Setup (5 minutes)

### Step 1: Configure Vercel Environment Variables

1. **Go to Vercel Dashboard:**
   - Visit: https://vercel.com/dashboard
   - Select your project: `umukozihr-tailor`

2. **Navigate to Settings:**
   - Click **Settings** tab
   - Click **Environment Variables** in left sidebar

3. **Add Production API URL:**
   ```
   Variable Name: NEXT_PUBLIC_API_URL
   Value: https://umukozihr-tailor-api.onrender.com
   Environment: Production, Preview, Development (check all)
   ```

4. **Click "Save"**

### Step 2: Redeploy Your Frontend

**Option A: Trigger Redeploy in Vercel**
1. Go to **Deployments** tab
2. Click on the latest deployment
3. Click **"Redeploy"** button
4. Wait 2-3 minutes for deployment

**Option B: Push a Git Commit**
```bash
cd client
git commit --allow-empty -m "chore: trigger redeploy for API configuration"
git push origin main
```

### Step 3: Verify Connection

1. **Visit your site:**
   - https://umukozihr-tailor.vercel.app

2. **Test the connection:**
   - Open browser console (F12)
   - Try to sign up or log in
   - Check for successful API calls to `umukozihr-tailor-api.onrender.com`

3. **If you see CORS errors:**
   - The backend is already configured for your domain
   - Just make sure the redeploy completed

---

## Environment Variables Summary

### Production (Vercel Dashboard)
```env
NEXT_PUBLIC_API_URL=https://umukozihr-tailor-api.onrender.com
```

### Staging (Optional - for testing)
```env
NEXT_PUBLIC_API_URL=https://umukozihr-tailor-api-staging.onrender.com
```

### Local Development (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
EMAIL=jason@umukozihr.com
PASSWORD=your-test-password
```

---

## Testing Your Deployment

### 1. Test Health Check
Open in browser or use curl:
```bash
curl https://umukozihr-tailor-api.onrender.com/health
# Expected: {"status":"healthy","service":"umukozihrtailor-backend"}
```

### 2. Test Signup (from frontend)
1. Go to https://umukozihr-tailor.vercel.app
2. Click "Sign Up"
3. Enter email and password
4. Should create account successfully

### 3. Test Complete Flow
1. Sign up / Log in
2. Complete onboarding (profile setup)
3. Add a job description
4. Generate tailored resume
5. Download PDF

---

## Troubleshooting

### Frontend shows "Network Error" or can't connect

**Check 1: Verify API URL in Vercel**
```
Settings → Environment Variables → NEXT_PUBLIC_API_URL
Should be: https://umukozihr-tailor-api.onrender.com
```

**Check 2: Verify backend is running**
```bash
curl https://umukozihr-tailor-api.onrender.com/health
```

**Check 3: Check CORS in browser console**
If you see CORS errors, the backend ALLOWED_ORIGINS is already set to your domain.
Just redeploy the frontend.

### API calls are going to localhost

**Solution:** You forgot to redeploy after setting environment variables.
1. Go to Vercel Deployments
2. Click "Redeploy" on latest deployment

### Environment variable not working

**Common issues:**
- Variable name must start with `NEXT_PUBLIC_` to be accessible in browser
- Must redeploy after changing environment variables
- Check you selected the right environment (Production/Preview/Development)

---

## API Endpoints Reference

### Authentication
```
POST /api/v1/auth/signup
POST /api/v1/auth/login
```

### Profile
```
GET /api/v1/profile
PUT /api/v1/profile
GET /api/v1/me/completeness
```

### Job Descriptions
```
POST /api/v1/jd/fetch
```

### Document Generation
```
POST /api/v1/generate/
GET /api/v1/generate/status/{run_id}
```

### History
```
GET /api/v1/history
POST /api/v1/history/{run_id}/regenerate
```

Full API documentation: https://umukozihr-tailor-api.onrender.com/docs

---

## Your Live URLs

| Service | URL |
|---------|-----|
| **Frontend (Vercel)** | https://umukozihr-tailor.vercel.app |
| **Backend API (Production)** | https://umukozihr-tailor-api.onrender.com |
| **Backend API (Staging)** | https://umukozihr-tailor-api-staging.onrender.com |
| **API Documentation** | https://umukozihr-tailor-api.onrender.com/docs |

---

## Next Steps

1. ✅ Set environment variable in Vercel
2. ✅ Redeploy frontend
3. ✅ Test complete user flow
4. ✅ Monitor for any errors

**That's it!** Your frontend should now be connected to the production backend.

---

**Questions?**
- Check Vercel logs: https://vercel.com/dashboard → Your Project → Deployments → Logs
- Check Render logs: https://dashboard.render.com/web/srv-d4o3btidbo4c73a6kp1g

**Last Updated:** 2025-12-03
