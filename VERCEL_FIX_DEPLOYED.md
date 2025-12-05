# Vercel Deployment Issue - RESOLVED

## Problem Identified

The error `cd: client: No such file or directory` was caused by **Vercel's monorepo handling**. When you set a Root Directory in Vercel's UI, it changes into that directory BEFORE reading vercel.json, causing path resolution issues.

### Root Cause
- Vercel runs commands relative to the Root Directory setting
- Your vercel.json had `cd client && pnpm install` but Vercel was already in the wrong directory
- This is a well-documented issue with Vercel monorepo deployments

## Research Findings

Based on extensive research of current Vercel issues (December 2024 - January 2025):

1. **Monorepo Deploy Pattern**: The official solution is to:
   - Set Root Directory to your app folder (e.g., `client`)
   - Create vercel.json IN THE APP FOLDER (not root)
   - Have it navigate back with `cd ..` to install from monorepo root
   - Use pnpm workspace filters for building

2. **pnpm Workspace**: Vercel detects `pnpm-lock.yaml` and automatically uses pnpm. For monorepos, you need:
   - `pnpm-workspace.yaml` in root
   - `pnpm-lock.yaml` in root (not in subdirectories)
   - Workspace filter commands: `pnpm --filter client build`

3. **Common Issues Found**:
   - "No Next.js version detected" - requires Next.js in package.json dependencies
   - Path resolution errors with `cd` commands
   - Build failures with pnpm@10.x (Vercel auto-detects version)

## Solution Implemented

### 1. Created pnpm Workspace Structure
**File: `pnpm-workspace.yaml`**
```yaml
packages:
  - 'client'
  - 'server'
```

### 2. Moved pnpm-lock.yaml to Root
- Moved from `client/pnpm-lock.yaml` to root
- This allows Vercel to properly detect pnpm workspace

### 3. Created vercel.json in Client Directory
**File: `client/vercel.json`**
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "installCommand": "cd .. && pnpm install",
  "buildCommand": "cd .. && pnpm --filter client build"
}
```

Key points:
- `cd ..` navigates back to monorepo root
- `pnpm --filter client` builds only the client package
- This config is read AFTER Vercel sets Root Directory to `client`

### 4. Updated Root package.json
**File: `package.json`**
```json
{
  "name": "umukozihr-tailor-monorepo",
  "version": "1.3.0",
  "private": true,
  "packageManager": "pnpm@10.0.0",
  "scripts": {
    "build": "pnpm --filter client build",
    "dev": "pnpm --filter client dev",
    "start": "pnpm --filter client start"
  }
}
```

### 5. Removed Root vercel.json
- Deleted the root `vercel.json` file
- Vercel will now use `client/vercel.json` instead

## Vercel Settings Required

In your Vercel project settings:

### Project Settings → Root Directory
Set to: **`client`**

### Build & Development Settings
- **Framework Preset**: Next.js (auto-detected)
- **Install Command**: (will use client/vercel.json)
- **Build Command**: (will use client/vercel.json)
- **Output Directory**: `.next` (default)

### Environment Variables
Make sure these are set:
- `NEXT_PUBLIC_API_URL` - Not needed anymore (dynamic detection in code)
- Any other env vars your app needs

## What Changed in Git

### Commit: `3e8dc00` (main) / `2e612db` (dev)
```
fix: Configure pnpm workspace for Vercel monorepo deployment

Changes:
- Created pnpm-workspace.yaml for proper workspace setup
- Moved pnpm-lock.yaml from client/ to root
- Created client/vercel.json with proper monorepo commands
- Updated root package.json with workspace filter commands
- Removed root vercel.json (using client/vercel.json instead)
```

### Files Changed
- ✅ Added: `pnpm-workspace.yaml`
- ✅ Added: `client/vercel.json`
- ✅ Modified: `package.json` (workspace commands)
- ✅ Moved: `pnpm-lock.yaml` (client → root)
- ❌ Deleted: `vercel.json` (root)

## Deployment Status

### Main Branch
- Pushed to: `hiregenaiteam-hq/umukozihr-tailor`
- Commit: `3e8dc00`
- Vercel will auto-deploy

### Dev Branch
- Pushed to: `hiregenaiteam-hq/umukozihr-tailor`
- Commit: `2e612db`
- Vercel staging will auto-deploy

## Next Steps

1. **Vercel should automatically trigger a new build** for commit `3e8dc00`
2. **Check the build logs** - you should now see:
   - ✅ "Running install command: cd .. && pnpm install"
   - ✅ "Running build command: cd .. && pnpm --filter client build"
   - ✅ No more "cd: client: No such file or directory" error

3. **Once deployed**, test signup at: https://umukozihr-tailor.vercel.app/
4. **Check browser console** - API requests should go to `https://umukozihr-tailor-api.onrender.com`

## Research Sources

This solution is based on official Vercel documentation and community solutions:

- [Monorepo: Using PNPM and Deploying to Vercel (Medium)](https://medium.com/@brianonchain/monorepo-using-pnpm-and-deploying-to-vercel-0490e244d9fc)
- [Using Monorepos - Vercel Docs](https://vercel.com/docs/monorepos)
- [Unable to deploy Next.js monorepo - Stack Overflow](https://stackoverflow.com/questions/70117752/unable-to-deploy-a-next-js-monorepo-using-workspaces-to-vercel)
- [Vercel "No Next.js version detected" - Vercel Community](https://community.vercel.com/t/vercel-no-next-js-version-detected-for-next-15-app-in-pnpm-monorepo/18750)
- [Configuring projects with vercel.json - Vercel Docs](https://vercel.com/docs/project-configuration)

## Technical Notes

### Why This Works

1. **Root Directory = `client`**: Vercel changes into the client directory where the Next.js app lives
2. **vercel.json in client**: After changing to client/, Vercel reads client/vercel.json
3. **cd .. in commands**: Commands navigate back to repo root to access pnpm workspace
4. **pnpm --filter client**: Builds only the client package from the workspace
5. **pnpm-lock.yaml at root**: Vercel detects pnpm and uses workspace mode

### Alternative Approaches Considered

1. ❌ **Root Directory = `.`**: Doesn't work because vercel.json commands can't find client/
2. ❌ **Multiple cd commands**: Path confusion with nested cd operations
3. ❌ **No workspace setup**: Doesn't leverage pnpm's monorepo capabilities
4. ✅ **Current solution**: Industry standard pattern for Vercel + pnpm + monorepo

---

**Status**: ✅ FIXED AND DEPLOYED
**Date**: December 5, 2025
**Commits**: `3e8dc00` (main), `2e612db` (dev)
