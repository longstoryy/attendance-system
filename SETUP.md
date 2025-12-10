# Setup Guide - Attendance Tracking System

## Quick Start (5 minutes)

### Step 1: Install Dependencies
```bash
# Install root dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..
```

### Step 2: Create Data Directory
```bash
mkdir data
```

### Step 3: Start Development Servers
```bash
npm run dev
```

This will automatically start:
- **Backend**: http://localhost:5000
- **Frontend**: http://localhost:3000

The frontend will automatically open in your browser.

---

## Detailed Setup Instructions

### Prerequisites
- **Node.js**: v14.0.0 or higher
  - Download from: https://nodejs.org/
  - Verify installation: `node --version` and `npm --version`

### Installation Steps

#### 1. Navigate to Project Directory
```bash
cd "c:\Users\LongStory GH\Desktop\attendance system"
```

#### 2. Install Backend Dependencies
```bash
npm install
```

This installs:
- express (web framework)
- sqlite3 (database)
- cors (cross-origin requests)
- dotenv (environment variables)
- uuid (unique identifiers)
- nodemon (auto-reload during development)

#### 3. Install Frontend Dependencies
```bash
cd client
npm install
cd ..
```

This installs:
- react & react-dom
- react-router-dom (navigation)
- axios (HTTP client)
- tailwindcss (styling)
- lucide-react (icons)
- date-fns (date utilities)

#### 4. Create Data Directory
```bash
mkdir data
```

The database file will be created automatically here.

---

## Running the Application

### Development Mode (Recommended)
```bash
npm run dev
```

This runs both servers concurrently:
- Backend with auto-reload (nodemon)
- Frontend with hot reload (React)

### Production Mode
```bash
# Build frontend
npm run build

# Start backend only
npm start
```

Then access the app at: http://localhost:5000

---

## Accessing the Application

### Local Development
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

### First Time Setup
1. The database will be created automatically on first run
2. Navigate to the Students page and add some students
3. Create classes on the Classes page
4. Mark attendance on the Attendance page
5. View reports on the Reports page

---

## Troubleshooting

### Port Already in Use
If port 5000 or 3000 is already in use:

**For Port 5000 (Backend):**
```bash
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

**For Port 3000 (Frontend):**
The React app will automatically use the next available port.

### Database Issues
If you encounter database errors:
```bash
# Delete the database file
rm data/attendance.db

# Restart the application
npm run dev
```

### Module Not Found Errors
```bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -r node_modules client/node_modules
npm install
cd client && npm install && cd ..
```

### API Connection Issues
1. Ensure backend is running on port 5000
2. Check browser console for errors (F12)
3. Verify `.env` file exists in root directory
4. Check that `data/` directory exists

---

## Environment Configuration

### .env File (Root Directory)
```
PORT=5000
NODE_ENV=development
DATABASE_PATH=./data/attendance.db
```

### Modifying Configuration
Edit `.env` to change:
- `PORT`: Backend server port (default: 5000)
- `NODE_ENV`: development or production
- `DATABASE_PATH`: Location of SQLite database

---

## File Structure After Setup

```
attendance-system/
├── data/
│   └── attendance.db          (created automatically)
├── server/
│   ├── index.js
│   ├── database.js
│   └── routes/
├── client/
│   ├── node_modules/
│   ├── public/
│   ├── src/
│   └── package.json
├── node_modules/
├── package.json
├── .env
└── README.md
```

---

## Development Workflow

### Making Changes

**Backend Changes:**
- Edit files in `server/` directory
- Server automatically reloads (nodemon)
- No need to restart

**Frontend Changes:**
- Edit files in `client/src/` directory
- Browser automatically refreshes (hot reload)
- No need to restart

### Testing Changes
1. Make your code changes
2. Check browser console for errors (F12)
3. Check terminal for backend errors
4. Refresh browser if needed

---

## Next Steps

1. **Add Sample Data**: Create a few students and classes
2. **Mark Attendance**: Practice marking attendance
3. **View Reports**: Check the reports page
4. **Explore Features**: Try all navigation links
5. **Review Code**: Understand the structure for future enhancements

---

## Common Tasks

### Add a Student
1. Click "Students" in navigation
2. Click "Add Student"
3. Fill in the form
4. Click "Create"

### Create a Class
1. Click "Classes" in navigation
2. Click "Add Class"
3. Fill in the form
4. Click "Create"

### Mark Attendance
1. Click "Attendance" in navigation
2. Click "Mark Attendance"
3. Select student, class, date, and status
4. Click "Mark"

### View Attendance Report
1. Click "Reports" in navigation
2. Select a student
3. Optionally filter by class
4. View the attendance summary
5. Download CSV if needed

---

## Performance Tips

For optimal performance:
- Keep browser developer tools closed
- Close unnecessary browser tabs
- Restart servers if experiencing slowness
- Clear browser cache periodically

---

## Getting Help

### Check Logs
- **Backend Errors**: Check terminal where `npm run dev` is running
- **Frontend Errors**: Open browser console (F12 → Console tab)

### Common Error Messages

| Error | Solution |
|-------|----------|
| `EADDRINUSE` | Port already in use, change PORT in .env |
| `Cannot find module` | Run `npm install` in affected directory |
| `Database locked` | Restart the application |
| `API not responding` | Ensure backend is running on port 5000 |

---

## Next Phase Development

Once comfortable with MVP, consider:
1. Adding user authentication
2. Implementing role-based access
3. Adding QR code scanning
4. Creating mobile app
5. Setting up PostgreSQL for production

See README.md for detailed future enhancement plans.

---

**Last Updated**: December 2024
**Version**: 1.0.0
