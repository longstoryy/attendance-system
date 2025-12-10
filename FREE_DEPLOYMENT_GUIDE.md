# 🆓 FREE Deployment Guide - 100% Free Services

Deploy your attendance system completely **FREE** using:
- **Frontend**: Netlify (Free)
- **Backend**: Render (Free)
- **Database**: PostgreSQL on Render (Free)

**Total Cost: $0/month** ✅

---

## Prerequisites

### Required Accounts (All Free)
- [ ] GitHub account (https://github.com/signup)
- [ ] Netlify account (https://app.netlify.com/signup)
- [ ] Render account (https://dashboard.render.com/register)

### Required Software
- [ ] Git (https://git-scm.com)
- [ ] Node.js v18+ (already installed)

---

## Step 1: Push Code to GitHub (10 minutes)

### 1.1 Initialize Git Repository

Open PowerShell in your project directory and run:

```powershell
git init
git add .
git commit -m "Initial commit - Attendance System with QR Scanner"
git branch -M main
```

### 1.2 Create GitHub Repository

1. Go to https://github.com/new
2. **Repository name**: `attendance-system`
3. **Description**: `Attendance tracking system with QR codes and authentication`
4. Choose **Public** (required for free Render deployment)
5. Click **"Create repository"**

### 1.3 Push to GitHub

Copy the commands from GitHub and run in PowerShell:

```powershell
git remote add origin https://github.com/YOUR_USERNAME/attendance-system.git
git push -u origin main
```

**Replace `YOUR_USERNAME` with your GitHub username!**

✅ **Verify**: Go to your GitHub repo and confirm all files are there.

---

## Step 2: Deploy Backend to Render (15 minutes)

### 2.1 Create Render Account

1. Go to https://dashboard.render.com/register
2. Sign up with GitHub (easier)
3. Authorize Render to access GitHub

### 2.2 Create Web Service

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Select your `attendance-system` repository
4. Fill in settings:
   - **Name**: `attendance-system-api`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server/index.js`
   - **Plan**: `Free` (selected by default)
5. Click **"Create Web Service"**

**Wait for deployment** (3-5 minutes)

### 2.3 Get Your Backend URL

After deployment, you'll see:
```
https://attendance-system-api.onrender.com
```

Save this URL - you'll need it for the frontend.

### 2.4 Add Environment Variables

1. In Render dashboard, go to your service
2. Click **"Environment"** tab
3. Add these variables:
   ```
   NODE_ENV = production
   API_URL = https://attendance-system-api.onrender.com
   JWT_SECRET = your-super-secret-key-change-this-12345
   ```
4. Click **"Save"**

**Note**: Render will auto-restart the service.

### 2.5 Create PostgreSQL Database

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"PostgreSQL"**
3. Fill in settings:
   - **Name**: `attendance-db`
   - **Database**: `attendance`
   - **User**: `attendance_user`
   - **Plan**: `Free` (selected by default)
4. Click **"Create Database"**

**Wait for creation** (2-3 minutes)

### 2.6 Connect Database to Backend

1. Go to your PostgreSQL database in Render
2. Copy the **Internal Database URL** (starts with `postgres://`)
3. Go back to your Web Service
4. Click **"Environment"** tab
5. Add variable:
   ```
   DATABASE_URL = [paste the URL here]
   ```
6. Click **"Save"**

### 2.7 Verify Backend

Open in browser:
```
https://attendance-system-api.onrender.com/api/health
```

You should see:
```json
{"status":"ok","timestamp":"2025-12-10T..."}
```

✅ **Backend is live!**

---

## Step 3: Deploy Frontend to Netlify (10 minutes)

### 3.1 Build Frontend

Open PowerShell in your project directory:

```powershell
cd client
npm run build
cd ..
```

This creates `client/build` folder.

### 3.2 Connect to Netlify

1. Go to https://app.netlify.com
2. Click **"Add new site"** → **"Import an existing project"**
3. Click **"GitHub"**
4. Authorize Netlify
5. Select your `attendance-system` repository
6. Netlify auto-detects settings:
   - **Build command**: `npm install && cd client && npm install && npm run build`
   - **Publish directory**: `client/build`
7. Click **"Deploy site"**

**Wait for deployment** (2-3 minutes)

### 3.3 Get Your Frontend URL

After deployment, you'll see:
```
https://your-site-name.netlify.app
```

Save this URL.

### 3.4 Add Environment Variable

1. Go to your Netlify site dashboard
2. Click **"Site settings"** → **"Build & deploy"** → **"Environment"**
3. Click **"Edit variables"**
4. Add variable:
   - **Key**: `REACT_APP_API_URL`
   - **Value**: `https://attendance-system-api.onrender.com`
5. Click **"Save"**

### 3.5 Trigger Rebuild

1. Go to **"Deploys"** tab
2. Click **"Trigger deploy"** → **"Deploy site"**

**Wait for deployment** (2-3 minutes)

✅ **Frontend is live!**

---

## Step 4: Test Live System (10 minutes)

### 4.1 Test Login

1. Open your Netlify URL: `https://your-site-name.netlify.app`
2. You should see the login page
3. Login with:
   - **Email**: `admin@attendance.local`
   - **Password**: `Admin@123456`

### 4.2 Test Features

- ✅ Add a class
- ✅ Add a student
- ✅ View student QR code
- ✅ Test QR scanner
- ✅ Mark attendance
- ✅ View reports
- ✅ Create users (admin only)

### 4.3 Test Backend API

Open in browser:
```
https://attendance-system-api.onrender.com/api/health
```

Should return:
```json
{"status":"ok","timestamp":"..."}
```

✅ **Everything is working!**

---

## Updating Code (After Deployment)

### Update Frontend

1. Make changes to code
2. Commit and push:
   ```powershell
   git add .
   git commit -m "Update frontend"
   git push origin main
   ```
3. Netlify automatically rebuilds and deploys

### Update Backend

1. Make changes to code
2. Commit and push:
   ```powershell
   git add .
   git commit -m "Update backend"
   git push origin main
   ```
3. Render automatically rebuilds and deploys

---

## Troubleshooting

### Frontend Not Loading

**Problem**: Blank page or 404 error

**Solution**:
1. Check Netlify build logs (Deploys tab)
2. Verify `REACT_APP_API_URL` is set correctly
3. Trigger rebuild: **"Trigger deploy"** → **"Deploy site"**

### Backend Not Responding

**Problem**: API calls fail or timeout

**Solution**:
1. Check Render logs (Logs tab in Web Service)
2. Verify `DATABASE_URL` is set
3. Check database connection in PostgreSQL service

### Database Connection Error

**Problem**: "Cannot connect to database"

**Solution**:
1. Go to PostgreSQL service in Render
2. Copy the **Internal Database URL**
3. Update `DATABASE_URL` in Web Service environment
4. Restart Web Service

### CORS Errors

**Problem**: "Access to XMLHttpRequest blocked by CORS policy"

**Solution**:
1. Verify `REACT_APP_API_URL` in Netlify environment
2. Check it matches your Render backend URL
3. No trailing slash (e.g., `https://attendance-system-api.onrender.com`)

---

## Free Tier Limits

| Service | Free Limit | Enough For? |
|---------|-----------|------------|
| Netlify | 100GB/month bandwidth | ✅ Yes |
| Render Web | 750 hours/month | ✅ Yes (always on) |
| Render PostgreSQL | 256MB storage | ✅ Yes (MVP) |
| GitHub | Unlimited | ✅ Yes |

**All limits are more than enough for MVP!**

---

## Monitoring

### View Backend Logs

1. Go to https://dashboard.render.com
2. Click your Web Service
3. Click **"Logs"** tab
4. See real-time logs

### View Database Status

1. Go to https://dashboard.render.com
2. Click your PostgreSQL service
3. See connection info and usage

### View Frontend Logs

1. Go to https://app.netlify.com
2. Click your site
3. Click **"Deploys"** tab
4. Click latest deploy to see build logs

---

## Next Steps

1. ✅ Deploy to production (you are here)
2. ✅ Test all features
3. ⏳ Gather user feedback
4. ⏳ Plan Phase 3 (NFC & Biometrics)

---

## Summary

**Your Live System:**
- 🌐 Frontend: `https://your-site-name.netlify.app`
- 🔌 Backend: `https://attendance-system-api.onrender.com`
- 💾 Database: PostgreSQL on Render
- 💰 Cost: **$0/month**

**Status**: ✅ Production Ready

---

**Last Updated**: December 10, 2025
**Version**: 1.0.0 (MVP with QR Scanner)
