const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = process.env.DATABASE_URL ? require('../database-postgres') : require('../database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Approve or reject a reason
router.post('/review', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'instructor') {
      return res.status(403).json({ error: 'Only instructors can approve reasons' });
    }

    const { reason_id, approved, approval_notes } = req.body;
    const instructor_id = req.user.id;

    if (!reason_id || approved === undefined) {
      return res.status(400).json({ error: 'reason_id and approved are required' });
    }

    // Get the reason and attendance record
    let reason;
    if (process.env.DATABASE_URL) {
      reason = await db.get('SELECT * FROM attendance_reasons WHERE id = $1', [reason_id]);
    } else {
      reason = await db.get('SELECT * FROM attendance_reasons WHERE id = ?', [reason_id]);
    }

    if (!reason) {
      return res.status(404).json({ error: 'Reason not found' });
    }

    const id = uuidv4();
    const now = new Date().toISOString();

    // Create approval record
    if (process.env.DATABASE_URL) {
      await db.run(
        `INSERT INTO attendance_approvals (id, reason_id, attendance_id, instructor_id, approved, approval_notes, reviewed_at, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [id, reason_id, reason.attendance_id, instructor_id, approved, approval_notes || null, now, now, now]
      );

      // Update reason status
      await db.run(
        'UPDATE attendance_reasons SET status = $1, updated_at = $2 WHERE id = $3',
        [approved ? 'approved' : 'rejected', now, reason_id]
      );
    } else {
      await db.run(
        `INSERT INTO attendance_approvals (id, reason_id, attendance_id, instructor_id, approved, approval_notes, reviewed_at, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, reason_id, reason.attendance_id, instructor_id, approved ? 1 : 0, approval_notes || null, now, now, now]
      );

      // Update reason status
      await db.run(
        'UPDATE attendance_reasons SET status = ?, updated_at = ? WHERE id = ?',
        [approved ? 'approved' : 'rejected', now, reason_id]
      );
    }

    const approval = process.env.DATABASE_URL
      ? await db.get('SELECT * FROM attendance_approvals WHERE id = $1', [id])
      : await db.get('SELECT * FROM attendance_approvals WHERE id = ?', [id]);

    res.status(201).json(approval);
  } catch (err) {
    console.error('Error reviewing reason:', err);
    res.status(500).json({ error: 'Failed to review reason' });
  }
});

// Get approvals for a reason
router.get('/reason/:reason_id', authenticate, async (req, res) => {
  try {
    const { reason_id } = req.params;

    let approvals;
    if (process.env.DATABASE_URL) {
      approvals = await db.all(
        `SELECT aa.*, u.username as instructor_name
         FROM attendance_approvals aa
         JOIN users u ON aa.instructor_id = u.id
         WHERE aa.reason_id = $1
         ORDER BY aa.reviewed_at DESC`,
        [reason_id]
      );
    } else {
      approvals = await db.all(
        `SELECT aa.*, u.username as instructor_name
         FROM attendance_approvals aa
         JOIN users u ON aa.instructor_id = u.id
         WHERE aa.reason_id = ?
         ORDER BY aa.reviewed_at DESC`,
        [reason_id]
      );
    }

    res.json(approvals);
  } catch (err) {
    console.error('Error fetching approvals:', err);
    res.status(500).json({ error: 'Failed to fetch approvals' });
  }
});

// Get all approvals by instructor
router.get('/instructor/:instructor_id', authenticate, async (req, res) => {
  try {
    const { instructor_id } = req.params;

    let approvals;
    if (process.env.DATABASE_URL) {
      approvals = await db.all(
        `SELECT aa.*, ar.reason_type, ar.reason_text, s.name as student_name
         FROM attendance_approvals aa
         JOIN attendance_reasons ar ON aa.reason_id = ar.id
         JOIN students s ON ar.student_id = s.id
         WHERE aa.instructor_id = $1
         ORDER BY aa.reviewed_at DESC`,
        [instructor_id]
      );
    } else {
      approvals = await db.all(
        `SELECT aa.*, ar.reason_type, ar.reason_text, s.name as student_name
         FROM attendance_approvals aa
         JOIN attendance_reasons ar ON aa.reason_id = ar.id
         JOIN students s ON ar.student_id = s.id
         WHERE aa.instructor_id = ?
         ORDER BY aa.reviewed_at DESC`,
        [instructor_id]
      );
    }

    res.json(approvals);
  } catch (err) {
    console.error('Error fetching instructor approvals:', err);
    res.status(500).json({ error: 'Failed to fetch approvals' });
  }
});

module.exports = router;
