const { Pool } = require('pg');

// Create connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Promisify database operations
const query = (text, params) => {
  return pool.query(text, params);
};

const initialize = async () => {
  try {
    // Students table
    await query(`
      CREATE TABLE IF NOT EXISTS students (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE,
        student_id TEXT UNIQUE NOT NULL,
        class_id TEXT,
        qr_code TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Classes table
    await query(`
      CREATE TABLE IF NOT EXISTS classes (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        code TEXT UNIQUE NOT NULL,
        instructor TEXT,
        schedule TEXT,
        capacity INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Add capacity column if it doesn't exist (migration for existing databases)
    try {
      await query(`
        ALTER TABLE classes ADD COLUMN capacity INT;
      `);
    } catch (err) {
      // Column already exists, ignore error
      if (!err.message.includes('already exists')) {
        console.warn('Warning adding capacity column:', err.message);
      }
    }

    // Attendance table
    await query(`
      CREATE TABLE IF NOT EXISTS attendance (
        id TEXT PRIMARY KEY,
        student_id TEXT NOT NULL,
        class_id TEXT NOT NULL,
        date DATE NOT NULL,
        time_in TIMESTAMP,
        time_out TIMESTAMP,
        status TEXT NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id),
        FOREIGN KEY (class_id) REFERENCES classes(id),
        UNIQUE(student_id, class_id, date)
      )
    `);

    // Add time_out column if it doesn't exist (migration for existing databases)
    try {
      await query(`
        ALTER TABLE attendance ADD COLUMN time_out TIMESTAMP;
      `);
    } catch (err) {
      // Column already exists, ignore error
      if (!err.message.includes('already exists')) {
        console.warn('Warning adding time_out column:', err.message);
      }
    }

    // Attendance summary table
    await query(`
      CREATE TABLE IF NOT EXISTS attendance_summary (
        id TEXT PRIMARY KEY,
        student_id TEXT NOT NULL,
        class_id TEXT NOT NULL,
        total_sessions INT DEFAULT 0,
        present_count INT DEFAULT 0,
        absent_count INT DEFAULT 0,
        late_count INT DEFAULT 0,
        attendance_rate DECIMAL(5,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id),
        FOREIGN KEY (class_id) REFERENCES classes(id),
        UNIQUE(student_id, class_id)
      )
    `);

    // Users table
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'staff',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // User sessions table
    await query(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        token TEXT UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Attendance reasons table (for late arrivals and absences)
    await query(`
      CREATE TABLE IF NOT EXISTS attendance_reasons (
        id TEXT PRIMARY KEY,
        attendance_id TEXT NOT NULL,
        student_id TEXT NOT NULL,
        reason_type TEXT NOT NULL,
        reason_text TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (attendance_id) REFERENCES attendance(id),
        FOREIGN KEY (student_id) REFERENCES students(id)
      )
    `);

    // Attendance approvals table (for instructor review)
    await query(`
      CREATE TABLE IF NOT EXISTS attendance_approvals (
        id TEXT PRIMARY KEY,
        reason_id TEXT NOT NULL,
        attendance_id TEXT NOT NULL,
        instructor_id TEXT NOT NULL,
        approved BOOLEAN,
        approval_notes TEXT,
        reviewed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (reason_id) REFERENCES attendance_reasons(id),
        FOREIGN KEY (attendance_id) REFERENCES attendance(id),
        FOREIGN KEY (instructor_id) REFERENCES users(id)
      )
    `);

    // Attendance notifications table
    await query(`
      CREATE TABLE IF NOT EXISTS attendance_notifications (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        attendance_id TEXT,
        reason_id TEXT,
        notification_type TEXT NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT false,
        read_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (attendance_id) REFERENCES attendance(id),
        FOREIGN KEY (reason_id) REFERENCES attendance_reasons(id)
      )
    `);

    // Class schedule table (for late arrival detection)
    await query(`
      CREATE TABLE IF NOT EXISTS class_schedules (
        id TEXT PRIMARY KEY,
        class_id TEXT NOT NULL,
        day_of_week INT NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        late_threshold_minutes INT DEFAULT 15,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (class_id) REFERENCES classes(id)
      )
    `);

    console.log('Database tables initialized successfully');
  } catch (err) {
    console.error('Database initialization error:', err);
  }
};

// Helper functions
const get = async (sql, params = []) => {
  try {
    const result = await query(sql, params);
    return result.rows[0];
  } catch (err) {
    console.error('Database query error:', err);
    throw err;
  }
};

const all = async (sql, params = []) => {
  try {
    const result = await query(sql, params);
    return result.rows;
  } catch (err) {
    console.error('Database query error:', err);
    throw err;
  }
};

const run = async (sql, params = []) => {
  try {
    const result = await query(sql, params);
    return result;
  } catch (err) {
    console.error('Database query error:', err);
    throw err;
  }
};

module.exports = {
  initialize,
  get,
  all,
  run,
  query,
  pool
};
