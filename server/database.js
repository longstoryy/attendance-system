const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../data/attendance.db');
const db = new sqlite3.Database(dbPath);

const initialize = () => {
  return new Promise((resolve) => {
    db.serialize(() => {
      // Students table
      db.run(`
        CREATE TABLE IF NOT EXISTS students (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT UNIQUE,
          student_id TEXT UNIQUE NOT NULL,
          class_id TEXT,
          qr_code TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Classes table
      db.run(`
        CREATE TABLE IF NOT EXISTS classes (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          code TEXT UNIQUE NOT NULL,
          instructor TEXT,
          schedule TEXT,
          capacity INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Attendance records table
      db.run(`
        CREATE TABLE IF NOT EXISTS attendance (
          id TEXT PRIMARY KEY,
          student_id TEXT NOT NULL,
          class_id TEXT NOT NULL,
          date DATE NOT NULL,
          time_in DATETIME,
          time_out DATETIME,
          status TEXT DEFAULT 'present',
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (student_id) REFERENCES students(id),
          FOREIGN KEY (class_id) REFERENCES classes(id),
          UNIQUE(student_id, class_id, date)
        )
      `);

      // Attendance summary table (for analytics)
      db.run(`
        CREATE TABLE IF NOT EXISTS attendance_summary (
          id TEXT PRIMARY KEY,
          student_id TEXT NOT NULL,
          class_id TEXT,
          total_sessions INTEGER DEFAULT 0,
          present_count INTEGER DEFAULT 0,
          absent_count INTEGER DEFAULT 0,
          late_count INTEGER DEFAULT 0,
          attendance_rate REAL DEFAULT 0,
          last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (student_id) REFERENCES students(id),
          FOREIGN KEY (class_id) REFERENCES classes(id)
        )
      `);

      // Users table (for authentication)
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          username TEXT UNIQUE NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          role TEXT NOT NULL DEFAULT 'staff',
          is_active BOOLEAN DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // User sessions table
      db.run(`
        CREATE TABLE IF NOT EXISTS user_sessions (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          token TEXT UNIQUE NOT NULL,
          expires_at DATETIME NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id)
        )
      `);

      // Attendance reasons table (for late arrivals and absences)
      db.run(`
        CREATE TABLE IF NOT EXISTS attendance_reasons (
          id TEXT PRIMARY KEY,
          attendance_id TEXT NOT NULL,
          student_id TEXT NOT NULL,
          reason_type TEXT NOT NULL,
          reason_text TEXT NOT NULL,
          status TEXT DEFAULT 'pending',
          submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (attendance_id) REFERENCES attendance(id),
          FOREIGN KEY (student_id) REFERENCES students(id)
        )
      `);

      // Attendance approvals table (for instructor review)
      db.run(`
        CREATE TABLE IF NOT EXISTS attendance_approvals (
          id TEXT PRIMARY KEY,
          reason_id TEXT NOT NULL,
          attendance_id TEXT NOT NULL,
          instructor_id TEXT NOT NULL,
          approved BOOLEAN,
          approval_notes TEXT,
          reviewed_at DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (reason_id) REFERENCES attendance_reasons(id),
          FOREIGN KEY (attendance_id) REFERENCES attendance(id),
          FOREIGN KEY (instructor_id) REFERENCES users(id)
        )
      `);

      // Attendance notifications table
      db.run(`
        CREATE TABLE IF NOT EXISTS attendance_notifications (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          attendance_id TEXT,
          reason_id TEXT,
          notification_type TEXT NOT NULL,
          message TEXT NOT NULL,
          is_read BOOLEAN DEFAULT 0,
          read_at DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id),
          FOREIGN KEY (attendance_id) REFERENCES attendance(id),
          FOREIGN KEY (reason_id) REFERENCES attendance_reasons(id)
        )
      `);

      // Class schedule table (for late arrival detection)
      db.run(`
        CREATE TABLE IF NOT EXISTS class_schedules (
          id TEXT PRIMARY KEY,
          class_id TEXT NOT NULL,
          day_of_week INTEGER NOT NULL,
          start_time TEXT NOT NULL,
          end_time TEXT NOT NULL,
          late_threshold_minutes INTEGER DEFAULT 15,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (class_id) REFERENCES classes(id)
        )
      `, () => {
        console.log('Database initialized successfully');
        resolve();
      });
    });
  });
};

const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

const get = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const all = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

module.exports = {
  db,
  initialize,
  run,
  get,
  all
};
