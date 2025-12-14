const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = process.env.DATABASE_URL ? require('../database-postgres') : require('../database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Submit a reason for late arrival or absence
router.post('/submit', authenticate, async (req, res) => {
  try {
    const { attendance_id, reason_type, reason_text } = req.body;
    const student_id = req.user.id;

    if (!attendance_id || !reason_type || !reason_text) {
      return res.status(400).json({ error: 'attendance_id, reason_type, and reason_text are required' });
    }

    // Validate reason type
    const validReasonTypes = ['late_arrival', 'absence', 'medical', 'other'];
    if (!validReasonTypes.includes(reason_type)) {
      return res.status(400).json({ error: 'Invalid reason type' });
    }

    const id = uuidv4();
    const now = new Date().toISOString();

    if (process.env.DATABASE_URL) {
      await db.run(
        `INSERT INTO attendance_reasons (id, attendance_id, student_id, reason_type, reason_text, status, submitted_at, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [id, attendance_id, student_id, reason_type, reason_text, 'pending', now, now, now]
      );
    } else {
      await db.run(
        `INSERT INTO attendance_reasons (id, attendance_id, student_id, reason_type, reason_text, status, submitted_at, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, attendance_id, student_id, reason_type, reason_text, 'pending', now, now, now]
      );
    }

    const reason = process.env.DATABASE_URL
      ? await db.get('SELECT * FROM attendance_reasons WHERE id = $1', [id])
      : await db.get('SELECT * FROM attendance_reasons WHERE id = ?', [id]);

    res.status(201).json(reason);
  } catch (err) {
    console.error('Error submitting reason:', err);
    res.status(500).json({ error: 'Failed to submit reason' });
  }
});

// Get pending reasons for instructor review
router.get('/pending', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'instructor') {
      return res.status(403).json({ error: 'Only instructors can review reasons' });
    }

    let reasons;
    if (process.env.DATABASE_URL) {
      reasons = await db.all(
        `SELECT ar.*, s.name as student_name, a.date, a.status as attendance_status
         FROM attendance_reasons ar
         JOIN students s ON ar.student_id = s.id
         JOIN attendance a ON ar.attendance_id = a.id
         WHERE ar.status = 'pending'
         ORDER BY ar.submitted_at DESC`,
        []
      );
    } else {
      reasons = await db.all(
        `SELECT ar.*, s.name as student_name, a.date, a.status as attendance_status
         FROM attendance_reasons ar
         JOIN students s ON ar.student_id = s.id
         JOIN attendance a ON ar.attendance_id = a.id
         WHERE ar.status = 'pending'
         ORDER BY ar.submitted_at DESC`,
        []
      );
    }

    res.json(reasons);
  } catch (err) {
    console.error('Error fetching pending reasons:', err);
    res.status(500).json({ error: 'Failed to fetch pending reasons' });
  }
});

// Get reasons for a specific student
router.get('/student/:student_id', authenticate, async (req, res) => {
  try {
    const { student_id } = req.params;

    let reasons;
    if (process.env.DATABASE_URL) {
      reasons = await db.all(
        `SELECT ar.*, a.date, a.status as attendance_status
         FROM attendance_reasons ar
         JOIN attendance a ON ar.attendance_id = a.id
         WHERE ar.student_id = $1
         ORDER BY ar.submitted_at DESC`,
        [student_id]
      );
    } else {
      reasons = await db.all(
        `SELECT ar.*, a.date, a.status as attendance_status
         FROM attendance_reasons ar
         JOIN attendance a ON ar.attendance_id = a.id
         WHERE ar.student_id = ?
         ORDER BY ar.submitted_at DESC`,
        [student_id]
      );
    }

    res.json(reasons);
  } catch (err) {
    console.error('Error fetching student reasons:', err);
    res.status(500).json({ error: 'Failed to fetch reasons' });
  }
});

// Get a specific reason
router.get('/:reason_id', authenticate, async (req, res) => {
  try {
    const { reason_id } = req.params;

    let reason;
    if (process.env.DATABASE_URL) {
      reason = await db.get(
        `SELECT ar.*, s.name as student_name, a.date, a.status as attendance_status
         FROM attendance_reasons ar
         JOIN students s ON ar.student_id = s.id
         JOIN attendance a ON ar.attendance_id = a.id
         WHERE ar.id = $1`,
        [reason_id]
      );
    } else {
      reason = await db.get(
        `SELECT ar.*, s.name as student_name, a.date, a.status as attendance_status
         FROM attendance_reasons ar
         JOIN students s ON ar.student_id = s.id
         JOIN attendance a ON ar.attendance_id = a.id
         WHERE ar.id = ?`,
        [reason_id]
      );
    }

    if (!reason) {
      return res.status(404).json({ error: 'Reason not found' });
    }

    res.json(reason);
  } catch (err) {
    console.error('Error fetching reason:', err);
    res.status(500).json({ error: 'Failed to fetch reason' });
  }
});

module.exports = router;
