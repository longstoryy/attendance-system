# Deployment Checklist - Quick Reference

## Pre-Deployment (Do This First)

- [ ] All code committed to Git
- [ ] No uncommitted changes
- [ ] Frontend builds successfully: `cd client && npm run build`
- [ ] Backend starts without errors: `npm run server:dev`
- [ ] All features tested locally
- [ ] Environment variables configured

---

## Step 1: GitHub Setup (5 minutes)

- [ ] Create GitHub account (if needed)
- [ ] Create new repository `attendance-system`
- [ ] Run `git init`
- [ ] Run `git add .`
- [ ] Run `git commit -m "Initial commit"`
- [ ] Run `git remote add origin https://github.com/YOUR_USERNAME/attendance-system.git`
- [ ] Run `git push -u origin main`
- [ ] Verify files on GitHub

---

## Step 2: Netlify Frontend Deployment (10 minutes)

- [ ] Create Netlify account
- [ ] Go to https://app.netlify.com
- [ ] Click "Add new site" → "Import an existing project"
- [ ] Select GitHub
- [ ] Authorize Netlify
- [ ] Select `attendance-system` repository
- [ ] Verify build settings:
  - Build command: `npm install && cd client && npm install && npm run build`
  - Publish directory: `client/build`
- [ ] Click "Deploy site"
- [ ] Wait for deployment (2-3 minutes)
- [ ] Note your Netlify URL: `https://your-site-name.netlify.app`
- [ ] Test frontend loads

---

## Step 3: Render Backend Deployment (15 minutes) - 100% FREE

### 3.1 Create Render Account
- [ ] Go to https://dashboard.render.com/register
- [ ] Sign up with GitHub (easier)
- [ ] Authorize Render to access GitHub

### 3.2 Create Web Service
- [ ] Go to https://dashboard.render.com
- [ ] Click "New +" → "Web Service"
- [ ] Select your `attendance-system` repository
- [ ] Fill in:
  - Name: `attendance-system-api`
  - Environment: `Node`
  - Build Command: `npm install`
  - Start Command: `node server/index.js`
  - Plan: `Free`
- [ ] Click "Create Web Service"
- [ ] Wait for deployment (3-5 minutes)
- [ ] Note your Render URL: `https://attendance-system-api.onrender.com`

### 3.3 Create PostgreSQL Database
- [ ] Click "New +" → "PostgreSQL"
- [ ] Fill in:
  - Name: `attendance-db`
  - Database: `attendance`
  - User: `attendance_user`
  - Plan: `Free`
- [ ] Click "Create Database"
- [ ] Wait for creation (2-3 minutes)
- [ ] Copy the **Internal Database URL**

### 3.4 Add Environment Variables
- [ ] Go to your Web Service
- [ ] Click "Environment" tab
- [ ] Add variables:
  - `NODE_ENV` = `production`
  - `API_URL` = `https://attendance-system-api.onrender.com`
  - `JWT_SECRET` = `your-secret-key-12345`
  - `DATABASE_URL` = (paste the PostgreSQL URL)
- [ ] Click "Save"
- [ ] Service auto-restarts

---

## Step 4: Connect Frontend to Backend (5 minutes)

- [ ] Go to Netlify site dashboard
- [ ] Click "Site settings" → "Build & deploy" → "Environment"
- [ ] Click "Edit variables"
- [ ] Add variable:
  - Key: `REACT_APP_API_URL`
  - Value: `https://attendance-system-api.onrender.com`
- [ ] Click "Save"
- [ ] Go to "Deploys" tab
- [ ] Click "Trigger deploy" → "Deploy site"
- [ ] Wait for rebuild (2-3 minutes)

---

## Step 5: Verification (10 minutes)

### Frontend Tests
- [ ] Open https://your-site-name.netlify.app
- [ ] Dashboard loads
- [ ] Add a class
- [ ] Add a student
- [ ] View student QR code
- [ ] Download QR code
- [ ] Mark attendance
- [ ] View reports
- [ ] Export CSV

### Backend Tests
- [ ] Open: `https://attendance-system-api.onrender.com/api/health`
- [ ] Should return: `{"status":"ok","timestamp":"..."}`
- [ ] Check Render logs: Go to Web Service → Logs tab
- [ ] No errors in logs

### Database Tests
- [ ] Add student in frontend
- [ ] Refresh page
- [ ] Student still appears (data persisted)
- [ ] Mark attendance
- [ ] Refresh page
- [ ] Attendance record still there

---

## Post-Deployment

- [ ] Share Netlify URL with users
- [ ] Monitor Heroku logs
- [ ] Check for errors
- [ ] Gather user feedback
- [ ] Plan Phase 2 implementation

---

## Troubleshooting Quick Fixes

### Frontend Blank Page
- Go to Netlify Deploys tab
- Click "Trigger deploy" → "Deploy site"
- Wait for rebuild (2-3 minutes)

### Backend Not Responding
- Go to Render Web Service
- Click "Logs" tab
- Check for errors
- Service auto-restarts on code changes

### Database Error
- Go to Render PostgreSQL service
- Check connection info
- Verify `DATABASE_URL` in Web Service environment

### CORS Error
- Verify `REACT_APP_API_URL` in Netlify environment
- Should be: `https://attendance-system-api.onrender.com` (no trailing slash)
- Trigger Netlify rebuild

---

## Important URLs

Save these for reference:

- **Frontend**: https://your-site-name.netlify.app
- **Backend API**: https://attendance-system-api.onrender.com
- **GitHub Repo**: https://github.com/YOUR_USERNAME/attendance-system
- **Netlify Dashboard**: https://app.netlify.com
- **Render Dashboard**: https://dashboard.render.com

---

## Time Estimate

| Step | Time |
|------|------|
| GitHub Setup | 5 min |
| Netlify Deployment | 10 min |
| Render Deployment | 15 min |
| Connect Frontend/Backend | 5 min |
| Verification | 10 min |
| **Total** | **45 minutes** |
| **Cost** | **$0** ✅ |

---

## Success Indicators

✅ **You're Done When:**
- Frontend loads at Netlify URL
- Backend API responds
- Can add students
- Can mark attendance
- Data persists after refresh
- No errors in logs
- QR codes display
- Reports generate

---

**Ready to Deploy?** Follow the checklist above step by step! 🚀
