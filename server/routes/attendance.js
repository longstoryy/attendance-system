const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = process.env.DATABASE_URL ? require('../database-postgres') : require('../database');

const router = express.Router();

// Mark attendance
router.post('/mark', async (req, res) => {
  try {
    const { student_id, class_id, date, status, notes } = req.body;

    console.log('Mark attendance request:', { student_id, class_id, date, status, notes });

    if (!student_id || !class_id || !date) {
      return res.status(400).json({ error: 'student_id, class_id, and date are required' });
    }

    const id = uuidv4();
    const time_in = new Date().toISOString();

    try {
      if (process.env.DATABASE_URL) {
        console.log('Using PostgreSQL for attendance mark');
        await db.run(
          'INSERT INTO attendance (id, student_id, class_id, date, time_in, status, notes) VALUES ($1, $2, $3, $4, $5, $6, $7)',
          [id, student_id, class_id, date, time_in, status || 'present', notes]
        );
        const record = await db.get('SELECT * FROM attendance WHERE id = $1', [id]);
        res.status(201).json(record);
      } else {
        console.log('Using SQLite for attendance mark');
        await db.run(
          'INSERT INTO attendance (id, student_id, class_id, date, time_in, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [id, student_id, class_id, date, time_in, status || 'present', notes]
        );
        const record = await db.get('SELECT * FROM attendance WHERE id = ?', [id]);
        res.status(201).json(record);
      }
    } catch (dbErr) {
      console.error('Database error in mark attendance:', {
        message: dbErr.message,
        code: dbErr.code,
        detail: dbErr.detail,
        sql: dbErr.sql
      });
      throw dbErr;
    }
  } catch (err) {
    console.error('Error marking attendance:', err);
    res.status(500).json({ error: err.message, details: err.code || 'Unknown error' });
  }
});

// Get attendance summary for student (must be before /:id route)
router.get('/summary/:student_id', async (req, res) => {
  try {
    const { class_id } = req.query;
    let query, params;

    if (process.env.DATABASE_URL) {
      query = `
        SELECT 
          student_id,
          class_id,
          COUNT(*) as total_sessions,
          SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_count,
          SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent_count,
          SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late_count,
          ROUND(100.0 * SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) / COUNT(*), 2) as attendance_rate
        FROM attendance
        WHERE student_id = $1
      `;
      params = [req.params.student_id];
      
      if (class_id) {
        query += ' AND class_id = $2';
        params.push(class_id);
      }
    } else {
      query = `
        SELECT 
          student_id,
          class_id,
          COUNT(*) as total_sessions,
          SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_count,
          SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent_count,
          SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late_count,
          ROUND(100.0 * SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) / COUNT(*), 2) as attendance_rate
        FROM attendance
        WHERE student_id = ?
      `;
      params = [req.params.student_id];
      
      if (class_id) {
        query += ' AND class_id = ?';
        params.push(class_id);
      }
    }

    query += ' GROUP BY student_id, class_id';

    const summary = await db.all(query, params);
    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get class attendance report (must be before /:id route)
router.get('/report/class/:class_id', async (req, res) => {
  try {
    const { date } = req.query;
    let query, params;

    if (process.env.DATABASE_URL) {
      query = `
        SELECT 
          a.id,
          a.student_id,
          s.name as student_name,
          s.student_id as student_number,
          a.status,
          a.date,
          a.time_in,
          a.notes
        FROM attendance a
        JOIN students s ON a.student_id = s.id
        WHERE a.class_id = $1
      `;
      params = [req.params.class_id];

      if (date) {
        query += ' AND a.date = $2';
        params.push(date);
      }
    } else {
      query = `
        SELECT 
          a.id,
          a.student_id,
          s.name as student_name,
          s.student_id as student_number,
          a.status,
          a.date,
          a.time_in,
          a.notes
        FROM attendance a
        JOIN students s ON a.student_id = s.id
        WHERE a.class_id = ?
      `;
      params = [req.params.class_id];

      if (date) {
        query += ' AND a.date = ?';
        params.push(date);
      }
    }

    query += ' ORDER BY a.date DESC, s.name ASC';
    const records = await db.all(query, params);
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get attendance records
router.get('/', async (req, res) => {
  try {
    const { student_id, class_id, date } = req.query;
    let query, params = [];

    if (process.env.DATABASE_URL) {
      query = 'SELECT * FROM attendance WHERE 1=1';
      let paramCount = 1;

      if (student_id) {
        query += ` AND student_id = $${paramCount++}`;
        params.push(student_id);
      }
      if (class_id) {
        query += ` AND class_id = $${paramCount++}`;
        params.push(class_id);
      }
      if (date) {
        query += ` AND date = $${paramCount++}`;
        params.push(date);
      }
    } else {
      query = 'SELECT * FROM attendance WHERE 1=1';

      if (student_id) {
        query += ' AND student_id = ?';
        params.push(student_id);
      }
      if (class_id) {
        query += ' AND class_id = ?';
        params.push(class_id);
      }
      if (date) {
        query += ' AND date = ?';
        params.push(date);
      }
    }

    query += ' ORDER BY date DESC, time_in DESC';
    const records = await db.all(query, params);
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get attendance by ID
router.get('/:id', async (req, res) => {
  try {
    if (process.env.DATABASE_URL) {
      const record = await db.get('SELECT * FROM attendance WHERE id = $1', [req.params.id]);
      if (!record) {
        return res.status(404).json({ error: 'Attendance record not found' });
      }
      res.json(record);
    } else {
      const record = await db.get('SELECT * FROM attendance WHERE id = ?', [req.params.id]);
      if (!record) {
        return res.status(404).json({ error: 'Attendance record not found' });
      }
      res.json(record);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update attendance
router.put('/:id', async (req, res) => {
  try {
    const { status, notes, time_out } = req.body;
    const id = req.params.id;

    if (process.env.DATABASE_URL) {
      await db.run(
        'UPDATE attendance SET status = $1, notes = $2, time_out = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4',
        [status, notes, time_out, id]
      );
      const record = await db.get('SELECT * FROM attendance WHERE id = $1', [id]);
      res.json(record);
    } else {
      await db.run(
        'UPDATE attendance SET status = ?, notes = ?, time_out = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [status, notes, time_out, id]
      );
      const record = await db.get('SELECT * FROM attendance WHERE id = ?', [id]);
      res.json(record);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
