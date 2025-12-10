# Phase 2: Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies (1 minute)

```bash
npm install bcryptjs jsonwebtoken
```

### Step 2: Initialize Admin User (1 minute)

```bash
node server/scripts/init-admin.js
```

**Output:**
```
✅ Admin user created successfully!

Default Admin Credentials:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Email:    admin@attendance.local
Password: Admin@123456
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️  IMPORTANT: Change this password immediately after first login!
```

### Step 3: Start Backend Server (1 minute)

```bash
npm run server:dev
```

**Expected Output:**
```
Attendance system server running on port 5000
Database tables initialized successfully
```

### Step 4: Start Frontend (in another terminal) (1 minute)

```bash
cd client
npm start
```

**Expected Output:**
```
Compiled successfully!
You can now view attendance-system-client in the browser.
  Local:            http://localhost:3000
```

### Step 5: Test Login (1 minute)

1. Open http://localhost:3000 in your browser
2. You'll see the login page
3. Enter credentials:
   - **Email**: `admin@attendance.local`
   - **Password**: `Admin@123456`
4. Click **Login**
5. You should see the dashboard! 🎉

---

## ✅ What You Should See

### Login Page
- Beautiful gradient background
- Email input field
- Password input field with show/hide toggle
- Login button
- Demo credentials displayed

### After Login
- Dashboard with statistics
- Navigation bar with menu items
- User email and role badge in top right
- Logout button

### Navigation Bar Shows
- Dashboard, Students, Classes, Attendance, Reports links
- Connection status (green = connected)
- Current user email
- User role badge (admin, instructor, staff, student)
- Logout button

---

## 🧪 Test These Features

### 1. Login
- [ ] Login with correct credentials
- [ ] See dashboard after login
- [ ] User email shown in navigation
- [ ] Role badge shows "admin"

### 2. Navigation
- [ ] Click on Students page
- [ ] Click on Classes page
- [ ] Click on Attendance page
- [ ] Click on Reports page
- [ ] All pages load correctly

### 3. Logout
- [ ] Click logout button (top right)
- [ ] Redirected to login page
- [ ] Token cleared from localStorage
- [ ] Cannot access dashboard without login

### 4. Protected Routes
- [ ] Try accessing http://localhost:3000/students without login
- [ ] Should redirect to login page
- [ ] Try accessing http://localhost:3000/classes without login
- [ ] Should redirect to login page

### 5. Token Persistence
- [ ] Login and refresh the page (F5)
- [ ] Should stay logged in
- [ ] User info should still be visible
- [ ] Logout and refresh
- [ ] Should redirect to login

---

## 🔐 Security Features

✅ **Password Hashing**: Passwords are hashed with bcrypt
✅ **JWT Tokens**: Secure token-based authentication
✅ **Protected Routes**: Cannot access pages without login
✅ **Session Storage**: Sessions stored in database
✅ **Token Expiration**: Tokens expire after 1 hour
✅ **Logout**: Clears token and session

---

## 📊 Default Admin User

| Field | Value |
|-------|-------|
| Email | admin@attendance.local |
| Password | Admin@123456 |
| Role | admin |
| Status | Active |

**⚠️ IMPORTANT**: Change this password immediately after first login!

---

## 🛠️ Troubleshooting

### Issue: "Cannot find module 'bcryptjs'"
**Solution**: Run `npm install bcryptjs jsonwebtoken`

### Issue: "Admin user already exists"
**Solution**: This is normal if you've already initialized. Just proceed to start the server.

### Issue: "Login fails with 'Invalid email or password'"
**Solution**: 
1. Make sure you're using the correct credentials
2. Check that the backend server is running
3. Check browser console for errors (F12)

### Issue: "Cannot access dashboard after login"
**Solution**:
1. Check that frontend is running on http://localhost:3000
2. Check that backend is running on http://localhost:5000
3. Check browser console for errors
4. Clear localStorage and try again

### Issue: "API server is not responding"
**Solution**:
1. Make sure backend is running: `npm run server:dev`
2. Check that port 5000 is not in use
3. Check terminal for error messages

---

## 📝 Next Steps

After testing Phase 2:

1. **Create More Users**
   - Use admin account to create instructor/staff/student users
   - Test different roles

2. **Test Role-Based Access**
   - Create instructor account
   - Login as instructor
   - Verify they can only see their own classes

3. **Deploy to Production**
   - Change JWT_SECRET
   - Change admin password
   - Deploy to Netlify + Heroku

4. **Implement Phase 2.5**
   - QR code scanning
   - One-click attendance marking

---

## 🎯 Success Criteria

You'll know Phase 2 is working when:

✅ Can login with admin credentials
✅ Dashboard loads after login
✅ User email shown in navigation
✅ Can navigate to all pages
✅ Can logout successfully
✅ Cannot access pages without login
✅ Token persists after page refresh
✅ No errors in browser console
✅ No errors in server terminal

---

## 📚 Documentation

For more details, see:
- `PHASE_2_AUTHENTICATION.md` - Complete implementation guide
- `PHASE_2_IMPLEMENTATION_STATUS.md` - Implementation details
- `README.md` - System overview

---

**Ready to test Phase 2?** Follow the 5 steps above! 🚀

If you encounter any issues, check the troubleshooting section or review the implementation status document.
