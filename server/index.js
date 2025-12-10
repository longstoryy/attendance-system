const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

// Use PostgreSQL in production, SQLite in development
const db = process.env.DATABASE_URL ? require('./database-postgres') : require('./database');
const studentRoutes = require('./routes/students');
const attendanceRoutes = require('./routes/attendance');
const classRoutes = require('./routes/classes');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize database
db.initialize().then(() => {
  console.log('✅ Database ready');
}).catch(err => {
  console.error('❌ Database initialization failed:', err);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/classes', classRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

app.listen(PORT, () => {
  console.log(`Attendance system server running on port ${PORT}`);
});

module.exports = app;
