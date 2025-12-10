# Quick Reference Guide

## Getting Started (30 seconds)

```bash
# 1. Install dependencies
npm install && cd client && npm install && cd ..

# 2. Create data directory
mkdir data

# 3. Start the app
npm run dev
```

Then open http://localhost:3000 in your browser.

---

## Main Features at a Glance

### 📊 Dashboard
- Real-time statistics
- Quick access to all features
- API health status

### 👥 Students
- Add/edit/delete students
- Search by name or ID
- Assign to classes

### 📚 Classes
- Create and manage classes
- Set instructor and schedule
- View class attendance

### ✓ Attendance
- Mark attendance (Present/Absent/Late)
- Filter by student/class/date
- Add notes to records

### 📈 Reports
- View attendance summaries
- Calculate attendance rates
- Download CSV reports

---

## API Endpoints Quick Reference

### Students
```
GET    /api/students              - List all
POST   /api/students              - Create
GET    /api/students/:id          - Get one
PUT    /api/students/:id          - Update
DELETE /api/students/:id          - Delete
```

### Classes
```
GET    /api/classes               - List all
POST   /api/classes               - Create
GET    /api/classes/:id           - Get one
PUT    /api/classes/:id           - Update
DELETE /api/classes/:id           - Delete
```

### Attendance
```
POST   /api/attendance/mark       - Mark attendance
GET    /api/attendance            - List (with filters)
GET    /api/attendance/:id        - Get one
PUT    /api/attendance/:id        - Update
GET    /api/attendance/summary/:student_id - Get summary
```

---

## Common Tasks

### Add a Student
1. Click "Students" → "Add Student"
2. Fill: Name, Student ID, Email (optional), Class (optional)
3. Click "Create"

### Create a Class
1. Click "Classes" → "Add Class"
2. Fill: Name, Code, Instructor (optional), Schedule (optional)
3. Click "Create"

### Mark Attendance
1. Click "Attendance" → "Mark Attendance"
2. Select: Student, Class, Date, Status
3. Add notes (optional)
4. Click "Mark"

### View Report
1. Click "Reports"
2. Select a student
3. Optionally filter by class
4. View summary or download CSV

---

## Database Tables

### students
```
id (UUID) | name | email | student_id | class_id | created_at | updated_at
```

### classes
```
id (UUID) | name | code | instructor | schedule | capacity | created_at | updated_at
```

### attendance
```
id | student_id | class_id | date | time_in | time_out | status | notes | created_at | updated_at
```

### attendance_summary
```
id | student_id | class_id | total_sessions | present_count | absent_count | late_count | attendance_rate
```

---

## Development Commands

```bash
# Start both servers
npm run dev

# Start backend only
npm run server:dev

# Start frontend only
npm run client:dev

# Build frontend for production
npm run build

# Run tests
npm test
```

---

## Environment Variables

Create `.env` in root directory:
```
PORT=5000
NODE_ENV=development
DATABASE_PATH=./data/attendance.db
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Port 5000 in use | Change PORT in .env |
| Module not found | Run `npm install` |
| Database error | Delete `data/attendance.db` and restart |
| API not responding | Ensure backend is running on port 5000 |
| Blank page | Check browser console (F12) for errors |

---

## File Locations

```
attendance-system/
├── server/
│   ├── index.js                 # Main server
│   ├── database.js              # DB setup
│   └── routes/                  # API endpoints
├── client/
│   ├── src/
│   │   ├── App.js               # Main app
│   │   ├── pages/               # Page components
│   │   └── components/          # Reusable components
│   └── package.json
├── data/
│   └── attendance.db            # SQLite database
├── package.json                 # Root dependencies
├── .env                         # Configuration
├── README.md                    # Full documentation
├── SETUP.md                     # Setup guide
├── ROADMAP.md                   # Future plans
└── QUICK_REFERENCE.md           # This file
```

---

## Key Technologies

| Component | Technology |
|-----------|-----------|
| Backend | Node.js + Express |
| Frontend | React 18 |
| Database | SQLite3 |
| Styling | TailwindCSS |
| Icons | Lucide React |
| HTTP Client | Axios |
| Routing | React Router v6 |
| Dates | date-fns |

---

## Performance Tips

- Keep browser dev tools closed
- Close unnecessary tabs
- Restart if experiencing slowness
- Clear browser cache periodically

---

## Next Steps

1. ✅ Install and run the app
2. ✅ Add sample students and classes
3. ✅ Mark some attendance records
4. ✅ View reports
5. ⏭️ Review ROADMAP.md for future features
6. ⏭️ Customize for your institution

---

## Support Resources

- **README.md** - Complete documentation
- **SETUP.md** - Detailed setup instructions
- **ROADMAP.md** - Future enhancement plans
- **Browser Console** - F12 for frontend errors
- **Terminal** - Check for backend errors

---

## Version Info

- **Version**: 1.0.0 (MVP)
- **Last Updated**: December 2024
- **Status**: Production Ready
- **License**: MIT

---

## Quick Links

- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- API Health: http://localhost:5000/api/health

---

**Need help?** Check README.md or SETUP.md for detailed information.
