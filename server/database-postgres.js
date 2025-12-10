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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Attendance table
    await query(`
      CREATE TABLE IF NOT EXISTS attendance (
        id TEXT PRIMARY KEY,
        student_id TEXT NOT NULL,
        class_id TEXT NOT NULL,
        attendance_date DATE NOT NULL,
        status TEXT NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id),
        FOREIGN KEY (class_id) REFERENCES classes(id),
        UNIQUE(student_id, class_id, attendance_date)
      )
    `);

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
