# Deployment Guide - Netlify + Heroku

## Overview
This guide walks you through deploying the Attendance Tracking System to production using:
- **Frontend**: Netlify (React app)
- **Backend**: Heroku (Node.js API + PostgreSQL)

---

## Prerequisites

### Required Accounts
- [ ] GitHub account (https://github.com)
- [ ] Netlify account (https://netlify.com)
- [ ] Heroku account (https://heroku.com)

### Required Software
- [ ] Git (https://git-scm.com)
- [ ] Heroku CLI (https://devcenter.heroku.com/articles/heroku-cli)
- [ ] Node.js v18+ (already installed)

---

## Step 1: Push Code to GitHub

### 1.1 Create GitHub Repository

1. Go to **https://github.com/new**
2. Repository name: `attendance-system`
3. Description: `Attendance tracking system with QR codes`
4. Choose **Public** or **Private**
5. Don't initialize with README
6. Click **"Create repository"**

### 1.2 Push Code

Run these commands in your project directory:

```bash
git init
git add .
git commit -m "Initial commit - Attendance System MVP with QR codes"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/attendance-system.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username.

**Verify**: Go to your GitHub repo and confirm all files are there.

---

## Step 2: Deploy Frontend to Netlify

### 2.1 Build Frontend

```bash
cd client
npm run build
cd ..
```

This creates `client/build` folder with optimized files.

### 2.2 Connect to Netlify

1. Go to **https://app.netlify.com**
2. Click **"Add new site"** → **"Import an existing project"**
3. Click **"GitHub"**
4. Authorize Netlify to access GitHub
5. Select your `attendance-system` repository
6. Netlify auto-detects settings:
   - **Build command**: `npm install && cd client && npm install && npm run build`
   - **Publish directory**: `client/build`
   - **Environment**: Leave blank for now
7. Click **"Deploy site"**

**Wait for deployment** (2-3 minutes)

### 2.3 Get Your Netlify URL

After deployment, you'll see:
```
https://your-site-name.netlify.app
```

Save this URL - you'll need it for the backend.

---

## Step 3: Deploy Backend to Heroku

### 3.1 Install Heroku CLI

Download from: **https://devcenter.heroku.com/articles/heroku-cli**

Then verify installation:
```bash
heroku --version
```

### 3.2 Login to Heroku

```bash
heroku login
```

This opens a browser to login. Complete the authentication.

### 3.3 Create Heroku App

```bash
heroku create attendance-system-api
```

This creates your app and sets up a Git remote.

**Note**: Your backend URL will be:
```
https://attendance-system-api.herokuapp.com
```

### 3.4 Add PostgreSQL Database

```bash
heroku addons:create heroku-postgresql:hobby-dev --app attendance-system-api
```

This creates a free PostgreSQL database and sets `DATABASE_URL` environment variable.

### 3.5 Set Environment Variables

```bash
heroku config:set NODE_ENV=production --app attendance-system-api
heroku config:set API_URL=https://attendance-system-api.herokuapp.com --app attendance-system-api
```

### 3.6 Deploy to Heroku

```bash
git push heroku main
```

**Wait for deployment** (3-5 minutes)

### 3.7 Verify Deployment

```bash
heroku logs --tail --app attendance-system-api
```

You should see:
```
Server running on port 8888
Database tables initialized successfully
```

---

## Step 4: Connect Frontend to Backend

### 4.1 Update Netlify Environment Variables

1. Go to your Netlify site dashboard
2. Click **"Site settings"** → **"Build & deploy"** → **"Environment"**
3. Click **"Edit variables"**
4. Add new variable:
   - **Key**: `REACT_APP_API_URL`
   - **Value**: `https://attendance-system-api.herokuapp.com`
5. Click **"Save"**

### 4.2 Trigger Netlify Rebuild

1. Go to **"Deploys"** tab
2. Click **"Trigger deploy"** → **"Deploy site"**

Wait for deployment to complete.

### 4.3 Test Connection

1. Go to your Netlify URL
2. Try adding a student
3. Check browser console (F12) for any errors
4. Verify data is saved

---

## Step 5: Verify Everything Works

### 5.1 Test Frontend

1. Open **https://your-site-name.netlify.app**
2. You should see the dashboard
3. Try these actions:
   - [ ] Add a class
   - [ ] Add a student
   - [ ] View student QR code
   - [ ] Mark attendance
   - [ ] View reports

### 5.2 Test Backend

```bash
curl https://attendance-system-api.herokuapp.com/api/health
```

Should return:
```json
{"status":"ok"}
```

### 5.3 Test Database

1. Add a student in the frontend
2. Verify it appears in the list
3. Refresh the page
4. Data should still be there (persisted in PostgreSQL)

---

## Troubleshooting

### Frontend Not Loading

**Problem**: Blank page or 404 error

**Solution**:
1. Check Netlify build logs
2. Verify `REACT_APP_API_URL` is set
3. Trigger rebuild in Netlify

### Backend Not Responding

**Problem**: API calls fail or timeout

**Solution**:
```bash
# Check Heroku logs
heroku logs --tail --app attendance-system-api

# Restart app
heroku restart --app attendance-system-api

# Check database connection
heroku pg:info --app attendance-system-api
```

### Database Connection Error

**Problem**: "Cannot connect to database"

**Solution**:
```bash
# Check DATABASE_URL is set
heroku config --app attendance-system-api

# Reset database
heroku pg:reset DATABASE --app attendance-system-api
```

### CORS Errors

**Problem**: "Access to XMLHttpRequest blocked by CORS policy"

**Solution**:
1. Verify `REACT_APP_API_URL` in Netlify
2. Check backend CORS settings in `server/index.js`
3. Ensure API URL doesn't have trailing slash

---

## Monitoring & Maintenance

### View Logs

```bash
# Backend logs
heroku logs --tail --app attendance-system-api

# Last 50 lines
heroku logs -n 50 --app attendance-system-api
```

### Check Database

```bash
# Database info
heroku pg:info --app attendance-system-api

# Connect to database
heroku pg:psql --app attendance-system-api
```

### Restart App

```bash
heroku restart --app attendance-system-api
```

### View Metrics

```bash
heroku metrics --app attendance-system-api
```

---

## Updating Code

### Update Frontend

1. Make changes to code
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Update frontend"
   git push origin main
   ```
3. Netlify automatically rebuilds and deploys

### Update Backend

1. Make changes to code
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Update backend"
   git push origin main
   ```
3. Deploy to Heroku:
   ```bash
   git push heroku main
   ```

---

## Scaling & Upgrades

### Upgrade Database

```bash
# View current plan
heroku pg:info --app attendance-system-api

# Upgrade to standard plan
heroku addons:upgrade heroku-postgresql:standard-0 --app attendance-system-api
```

### Upgrade Dyno (Server)

```bash
# View current dyno
heroku ps --app attendance-system-api

# Upgrade to paid dyno
heroku ps:resize web=standard-1x --app attendance-system-api
```

### Add More Resources

```bash
# Add worker dyno
heroku ps:scale worker=1 --app attendance-system-api
```

---

## Backup & Recovery

### Backup Database

```bash
# Create backup
heroku pg:backups:capture --app attendance-system-api

# List backups
heroku pg:backups --app attendance-system-api

# Download backup
heroku pg:backups:download --app attendance-system-api
```

### Restore from Backup

```bash
# Restore from backup
heroku pg:backups:restore b001 DATABASE_URL --app attendance-system-api
```

---

## Security Checklist

- [ ] Set strong environment variables
- [ ] Enable HTTPS (automatic with Netlify & Heroku)
- [ ] Configure CORS properly
- [ ] Use environment variables for secrets
- [ ] Enable database backups
- [ ] Monitor logs for errors
- [ ] Set up alerts for failures
- [ ] Regularly update dependencies

---

## Cost Summary

### Free Tier (Recommended for MVP)

| Service | Cost | Limits |
|---------|------|--------|
| Netlify | Free | 100GB/month bandwidth |
| Heroku | Free | 1 dyno, 10K rows DB |
| PostgreSQL | Free | 10K rows |
| **Total** | **$0/month** | Good for MVP |

### Paid Tier (When Scaling)

| Service | Cost | Limits |
|---------|------|--------|
| Netlify | $19/month | Unlimited |
| Heroku | $7/month | 1 paid dyno |
| PostgreSQL | $9/month | 10GB DB |
| **Total** | **~$35/month** | Production ready |

---

## Support & Resources

### Netlify Docs
- https://docs.netlify.com
- https://docs.netlify.com/routing/overview

### Heroku Docs
- https://devcenter.heroku.com
- https://devcenter.heroku.com/articles/heroku-postgresql

### GitHub Docs
- https://docs.github.com

---

## Next Steps

1. ✅ Deploy to production
2. ✅ Test all features
3. ✅ Gather user feedback
4. ⏳ Plan Phase 2 (Authentication)
5. ⏳ Implement Phase 2.5 (QR Scanning)

---

**Deployment Status**: Ready for Production
**Last Updated**: December 10, 2025
**Version**: 1.0.0 (MVP)
