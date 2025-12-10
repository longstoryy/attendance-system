# Attendance Tracking System

A modern, scalable attendance tracking system designed for large student populations. Built with Node.js/Express backend and React frontend.

## MVP Features

### Core Functionality
- **Student Management**: Add, edit, delete, and search students with unique QR codes
- **Class Management**: Create and manage classes with instructor and schedule information
- **QR Code-Based Attendance**: Scan unique student QR codes using smartphone/tablet to mark attendance instantly
- **Real-Time Data Synchronization**: Instant updates across all devices and interfaces
- **Attendance Marking**: Quick and easy attendance recording with status options (Present, Absent, Late)
- **Attendance Reports**: View individual student attendance summaries with attendance rates
- **Data Filtering**: Filter attendance records by student, class, and date
- **CSV Export**: Download attendance reports as CSV files
- **User-Friendly Interface**: Optimized for teachers and staff with intuitive navigation

### Dashboard
- Real-time statistics (total students, classes, today's attendance)
- Quick access links to main features
- API health status indicator

## Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: SQLite3 (easily upgradeable to PostgreSQL)
- **API**: RESTful API

### Frontend
- **Framework**: React 18
- **Styling**: TailwindCSS
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Routing**: React Router v6
- **Date Handling**: date-fns

## Project Structure

```
attendance-system/
├── server/
│   ├── index.js                 # Main server entry point
│   ├── database.js              # Database initialization and helpers
│   └── routes/
│       ├── students.js          # Student endpoints
│       ├── classes.js           # Class endpoints
│       └── attendance.js        # Attendance endpoints
├── client/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── index.js
│   │   ├── index.css
│   │   ├── App.js
│   │   ├── components/
│   │   │   └── Navigation.js
│   │   └── pages/
│   │       ├── Dashboard.js
│   │       ├── Students.js
│   │       ├── Classes.js
│   │       ├── Attendance.js
│   │       └── Reports.js
│   ├── package.json
│   ├── tailwind.config.js
│   └── postcss.config.js
├── package.json
├── .env
└── README.md
```

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Setup

1. **Install dependencies**
   ```bash
   npm install
   cd client && npm install && cd ..
   ```

2. **Create data directory**
   ```bash
   mkdir data
   ```

3. **Start the development servers**
   ```bash
   npm run dev
   ```

   This will start:
   - Backend server on `http://localhost:5000`
   - Frontend on `http://localhost:3000`

## API Endpoints

### Students
- `GET /api/students` - Get all students
- `GET /api/students/:id` - Get student by ID
- `POST /api/students` - Create new student
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student
- `GET /api/students/class/:class_id` - Get students by class

### Classes
- `GET /api/classes` - Get all classes
- `GET /api/classes/:id` - Get class by ID
- `POST /api/classes` - Create new class
- `PUT /api/classes/:id` - Update class
- `DELETE /api/classes/:id` - Delete class

### Attendance
- `POST /api/attendance/mark` - Mark attendance
- `GET /api/attendance` - Get attendance records (supports filtering)
- `GET /api/attendance/:id` - Get attendance record by ID
- `PUT /api/attendance/:id` - Update attendance record
- `GET /api/attendance/summary/:student_id` - Get attendance summary for student
- `GET /api/attendance/report/class/:class_id` - Get class attendance report

## Database Schema

### Students Table
- `id` (UUID, Primary Key)
- `name` (Text, Required)
- `email` (Text, Unique)
- `student_id` (Text, Unique, Required)
- `class_id` (Foreign Key)
- `created_at` (DateTime)
- `updated_at` (DateTime)

### Classes Table
- `id` (UUID, Primary Key)
- `name` (Text, Required)
- `code` (Text, Unique, Required)
- `instructor` (Text)
- `schedule` (Text)
- `capacity` (Integer)
- `created_at` (DateTime)
- `updated_at` (DateTime)

### Attendance Table
- `id` (UUID, Primary Key)
- `student_id` (Foreign Key)
- `class_id` (Foreign Key)
- `date` (Date)
- `time_in` (DateTime)
- `time_out` (DateTime)
- `status` (Text: present, absent, late)
- `notes` (Text)
- `created_at` (DateTime)
- `updated_at` (DateTime)

### Attendance Summary Table
- `id` (UUID, Primary Key)
- `student_id` (Foreign Key)
- `class_id` (Foreign Key)
- `total_sessions` (Integer)
- `present_count` (Integer)
- `absent_count` (Integer)
- `late_count` (Integer)
- `attendance_rate` (Real)
- `last_updated` (DateTime)

## Future Enhancements

### Phase 2: NFC & Biometric Integration
- **NFC Tag-Based Attendance**: Quicker, more secure check-ins using NFC technology
- **Fingerprint Recognition**: Biometric authentication for enhanced security
- **Mobile App**: Native mobile application for QR code scanning and attendance marking
- **Real-time Notifications**: Email/SMS alerts for low attendance
- **Advanced Analytics**: Trend analysis, predictive analytics
- **Multi-language Support**: Internationalization (i18n)

### Phase 3: Enterprise Features
- **Role-based Access Control**: Admin, instructor, student roles
- **Audit Logging**: Track all changes for compliance
- **Integration APIs**: Connect with student information systems
- **Batch Operations**: Bulk import/export of student data
- **Custom Reports**: Advanced reporting with custom filters

### Phase 4: Scalability & Performance
- **Database Migration**: PostgreSQL for production
- **Caching**: Redis for performance optimization
- **Load Balancing**: Horizontal scaling support
- **API Rate Limiting**: Prevent abuse
- **Data Archival**: Automatic archival of old records

### Phase 5: Security & Compliance
- **Authentication**: JWT-based authentication
- **Authorization**: Fine-grained permission system
- **Encryption**: End-to-end encryption for sensitive data
- **GDPR Compliance**: Data privacy features
- **Audit Trail**: Complete audit logging

## Configuration

### Environment Variables (.env)
```
PORT=5000
NODE_ENV=development
DATABASE_PATH=./data/attendance.db
```

## Usage Examples

### Adding a Student
1. Navigate to Students page
2. Click "Add Student"
3. Fill in name, student ID, email, and class
4. Click "Create"

### Marking Attendance
1. Navigate to Attendance page
2. Click "Mark Attendance"
3. Select student, class, date, and status
4. Add optional notes
5. Click "Mark"

### Viewing Reports
1. Navigate to Reports page
2. Select a student
3. Optionally filter by class
4. View attendance summary with rates
5. Download CSV if needed

## Troubleshooting

### API Connection Issues
- Ensure backend server is running on port 5000
- Check that no other process is using port 5000
- Verify `.env` file configuration

### Database Issues
- Ensure `data/` directory exists
- Check file permissions on database file
- Delete `data/attendance.db` to reset database

### Frontend Issues
- Clear browser cache
- Ensure frontend is running on port 3000
- Check browser console for errors

## Performance Considerations

### For Large Student Populations
1. **Database Indexing**: Indexes on frequently queried fields
2. **Pagination**: Implement pagination for large datasets
3. **Caching**: Cache frequently accessed data
4. **Batch Operations**: Bulk attendance marking
5. **Data Archival**: Archive old records to improve query performance

## Testing

Run tests with:
```bash
npm test
```

## Deployment

### Production Build
```bash
npm run build
```

### Docker Deployment (Future)
Dockerfile and docker-compose.yml will be added for containerized deployment.

## License

MIT License - Feel free to use this project for educational and commercial purposes.

## Support

For issues, questions, or suggestions, please open an issue in the repository.

## Roadmap

- [x] MVP with core features
- [ ] User authentication
- [ ] Role-based access control
- [ ] Mobile app
- [ ] QR code scanning
- [ ] Advanced analytics
- [ ] PostgreSQL support
- [ ] Docker deployment
- [ ] API documentation (Swagger)
- [ ] Automated testing

---

**Last Updated**: December 2024
**Version**: 1.0.0 (MVP)
