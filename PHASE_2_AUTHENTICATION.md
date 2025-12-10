# Phase 2: Authentication & Authorization Implementation Guide

## Overview
Phase 2 adds user authentication and role-based access control to the Attendance Tracking System. This ensures only authorized users can access the system and their actions are limited by their role.

**Timeline**: Q1 2025 (4-6 weeks)
**Priority**: High
**Status**: Ready for Implementation

---

## What Will Be Implemented

### 1. User Authentication System
- JWT (JSON Web Token) based authentication
- Secure login/logout functionality
- Password hashing with bcrypt
- Session management
- Token refresh mechanism

### 2. Role-Based Access Control (RBAC)
Four user roles with different permissions:

| Role | Permissions |
|------|-------------|
| **Admin** | Full system access, manage users, manage all classes |
| **Instructor** | Manage own classes, mark attendance, view reports |
| **Staff** | Mark attendance for assigned classes |
| **Student** | View own attendance records only |

### 3. User Management
- Admin can create/edit/delete users
- User profiles with email and role
- Password reset functionality
- Account activation/deactivation

---

## Technical Implementation

### Backend Dependencies to Add
```bash
npm install bcryptjs jsonwebtoken
npm install dotenv  # Already installed
```

### New Database Tables

#### Users Table
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### User Sessions Table
```sql
CREATE TABLE user_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT FOREIGN KEY,
  token TEXT UNIQUE NOT NULL,
  expires_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### New API Endpoints

#### Authentication Endpoints
```
POST   /api/auth/login              - User login
POST   /api/auth/logout             - User logout
POST   /api/auth/refresh            - Refresh token
GET    /api/auth/me                 - Get current user
```

#### User Management Endpoints (Admin Only)
```
GET    /api/users                   - List all users
GET    /api/users/:id               - Get user by ID
POST   /api/users                   - Create new user
PUT    /api/users/:id               - Update user
DELETE /api/users/:id               - Delete user
POST   /api/users/:id/reset-password - Reset user password
```

---

## Implementation Steps

### Step 1: Backend Setup (Week 1)

#### 1.1 Update Database Schema
- Add `users` table
- Add `user_sessions` table
- Add `user_id` field to relevant tables (optional)

#### 1.2 Create Authentication Middleware
- JWT verification middleware
- Role-based authorization middleware
- Session validation middleware

#### 1.3 Create Authentication Routes
- `/api/auth/login` - Authenticate user
- `/api/auth/logout` - Invalidate session
- `/api/auth/refresh` - Get new token
- `/api/auth/me` - Get current user info

#### 1.4 Create User Management Routes
- CRUD operations for users
- Password reset functionality
- User activation/deactivation

#### 1.5 Protect Existing Endpoints
- Add authentication middleware to all routes
- Add role-based checks where needed
- Update error handling

### Step 2: Frontend Setup (Week 2)

#### 2.1 Create Login Page
- Email/password input fields
- Login button
- Error message display
- Remember me option (optional)

#### 2.2 Update Navigation
- Add logout button
- Show current user name
- Role-based menu visibility

#### 2.3 Create Protected Routes
- Redirect unauthenticated users to login
- Check user role for page access
- Handle token expiration

#### 2.4 Add Session Management
- Store token in localStorage/sessionStorage
- Refresh token before expiration
- Clear session on logout

#### 2.5 Create User Management Page (Admin Only)
- List all users
- Add new user
- Edit user details
- Delete user
- Reset user password

### Step 3: Testing (Week 3)

#### 3.1 Unit Tests
- Authentication logic
- Password hashing
- Token generation/validation
- Role-based checks

#### 3.2 Integration Tests
- Login/logout flow
- Token refresh
- Protected routes
- Role-based access

#### 3.3 Manual Testing
- Test all user roles
- Test password reset
- Test session timeout
- Test token expiration

### Step 4: Deployment (Week 4)

#### 4.1 Production Setup
- Update environment variables
- Configure JWT secret
- Set token expiration times
- Configure CORS for authentication

#### 4.2 Data Migration
- Create initial admin user
- Migrate existing data
- Set default roles for existing users

#### 4.3 Documentation
- Update API documentation
- Create user guide
- Document role permissions
- Create troubleshooting guide

---

## User Roles & Permissions

### Admin Role
**Permissions:**
- ✅ Create/edit/delete users
- ✅ View all classes
- ✅ View all students
- ✅ View all attendance records
- ✅ Generate system reports
- ✅ Manage system settings

**Access:**
- All pages and features
- User management page
- System settings page

### Instructor Role
**Permissions:**
- ✅ Manage own classes
- ✅ View students in own classes
- ✅ Mark attendance
- ✅ View attendance reports for own classes
- ❌ Cannot manage other instructors' classes
- ❌ Cannot manage users

**Access:**
- Dashboard
- Students (own classes only)
- Classes (own classes only)
- Attendance (own classes only)
- Reports (own classes only)

### Staff Role
**Permissions:**
- ✅ Mark attendance for assigned classes
- ✅ View attendance records
- ❌ Cannot modify student data
- ❌ Cannot manage classes
- ❌ Cannot manage users

**Access:**
- Dashboard
- Attendance (mark only)
- Reports (view only)

### Student Role
**Permissions:**
- ✅ View own attendance
- ✅ View own reports
- ❌ Cannot mark attendance
- ❌ Cannot view other students' data
- ❌ Cannot manage anything

**Access:**
- Dashboard (limited)
- Reports (own only)

---

## Security Considerations

### Password Security
- Hash passwords with bcrypt (10 rounds minimum)
- Never store plain text passwords
- Enforce strong password requirements
- Implement password reset securely

### Token Security
- Use JWT with HS256 or RS256 algorithm
- Set reasonable token expiration (1 hour)
- Implement token refresh mechanism
- Store tokens securely on frontend

### Session Security
- Validate tokens on every request
- Check user is still active
- Invalidate tokens on logout
- Implement CSRF protection

### Data Protection
- Encrypt sensitive data in transit (HTTPS)
- Validate all user inputs
- Implement rate limiting
- Log authentication events

---

## Configuration

### Environment Variables
```
JWT_SECRET=your-secret-key-here
JWT_EXPIRATION=3600  # 1 hour in seconds
REFRESH_TOKEN_EXPIRATION=604800  # 7 days
BCRYPT_ROUNDS=10
```

### Frontend Storage
```javascript
// Store token in localStorage
localStorage.setItem('token', token);

// Retrieve token
const token = localStorage.getItem('token');

// Clear on logout
localStorage.removeItem('token');
```

---

## Testing Scenarios

### Test 1: Admin Login
1. Navigate to login page
2. Enter admin credentials
3. Click login
4. Should redirect to dashboard
5. Should see all menu items

### Test 2: Instructor Login
1. Login as instructor
2. Should only see own classes
3. Should be able to mark attendance
4. Should not see user management

### Test 3: Token Expiration
1. Login and get token
2. Wait for token to expire
3. Try to access protected route
4. Should redirect to login
5. Should show "Session expired" message

### Test 4: Role-Based Access
1. Login as student
2. Try to access admin page
3. Should be denied access
4. Should see "Access denied" message

### Test 5: Password Reset
1. Click "Forgot password"
2. Enter email
3. Receive reset link
4. Set new password
5. Login with new password

---

## Migration Plan

### For Existing Users
1. Create admin account during setup
2. Admin creates accounts for instructors
3. Instructors create accounts for staff
4. Students can be auto-created or manually added

### Data Preservation
- All existing student data preserved
- All existing class data preserved
- All existing attendance records preserved
- Add user_id to attendance records (optional)

---

## Success Criteria

- ✅ Users can login with email/password
- ✅ JWT tokens are generated and validated
- ✅ Users can logout and clear session
- ✅ Role-based access control works
- ✅ Protected routes redirect unauthenticated users
- ✅ Admin can manage users
- ✅ Password reset works
- ✅ Token refresh works
- ✅ All tests pass
- ✅ No security vulnerabilities

---

## Next Steps After Phase 2

1. **Phase 2.5**: QR Code Scanning
   - Implement QR code scanner
   - One-click attendance marking

2. **Phase 3**: NFC & Biometrics
   - NFC tag integration
   - Facial recognition
   - Mobile app

3. **Phase 4**: Advanced Analytics
   - Attendance trends
   - Predictive analytics
   - Advanced reports

---

## Resources & References

### Libraries
- **bcryptjs**: Password hashing
- **jsonwebtoken**: JWT token management
- **express-jwt**: JWT middleware for Express

### Best Practices
- OWASP Authentication Cheat Sheet
- JWT Best Practices
- Node.js Security Best Practices

### Documentation
- JWT.io - JWT introduction
- bcryptjs documentation
- Express.js middleware guide

---

## Timeline Summary

| Week | Task | Status |
|------|------|--------|
| Week 1 | Backend setup & authentication | ⏳ Planned |
| Week 2 | Frontend setup & UI | ⏳ Planned |
| Week 3 | Testing & bug fixes | ⏳ Planned |
| Week 4 | Deployment & documentation | ⏳ Planned |

---

**Phase Status**: Ready for Implementation
**Estimated Start**: January 2025
**Estimated Completion**: February 2025
**Priority**: High
