const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = process.env.DATABASE_URL ? require('../database-postgres') : require('../database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Create a notification
const createNotification = async (userId, notificationType, message, attendanceId = null, reasonId = null) => {
  try {
    const id = uuidv4();
    const now = new Date().toISOString();

    if (process.env.DATABASE_URL) {
      await db.run(
        `INSERT INTO attendance_notifications (id, user_id, attendance_id, reason_id, notification_type, message, is_read, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [id, userId, attendanceId || null, reasonId || null, notificationType, message, false, now]
      );
    } else {
      await db.run(
        `INSERT INTO attendance_notifications (id, user_id, attendance_id, reason_id, notification_type, message, is_read, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, userId, attendanceId || null, reasonId || null, notificationType, message, 0, now]
      );
    }

    return id;
  } catch (err) {
    console.error('Error creating notification:', err);
    throw err;
  }
};

// Get user notifications
router.get('/', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { unread_only } = req.query;

    let query = `SELECT * FROM attendance_notifications WHERE user_id = ?`;
    let params = [userId];

    if (unread_only === 'true') {
      query += ` AND is_read = ?`;
      params.push(process.env.DATABASE_URL ? false : 0);
    }

    query += ` ORDER BY created_at DESC LIMIT 50`;

    let notifications;
    if (process.env.DATABASE_URL) {
      query = query.replace(/\?/g, (match, offset) => {
        const paramIndex = params.slice(0, offset / 2).length;
        return `$${paramIndex + 1}`;
      });
      notifications = await db.all(query, params);
    } else {
      notifications = await db.all(query, params);
    }

    res.json(notifications);
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Mark notification as read
router.put('/:notification_id/read', authenticate, async (req, res) => {
  try {
    const { notification_id } = req.params;
    const now = new Date().toISOString();

    if (process.env.DATABASE_URL) {
      await db.run(
        'UPDATE attendance_notifications SET is_read = $1, read_at = $2 WHERE id = $3',
        [true, now, notification_id]
      );
    } else {
      await db.run(
        'UPDATE attendance_notifications SET is_read = ?, read_at = ? WHERE id = ?',
        [1, now, notification_id]
      );
    }

    const notification = process.env.DATABASE_URL
      ? await db.get('SELECT * FROM attendance_notifications WHERE id = $1', [notification_id])
      : await db.get('SELECT * FROM attendance_notifications WHERE id = ?', [notification_id]);

    res.json(notification);
  } catch (err) {
    console.error('Error marking notification as read:', err);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// Mark all notifications as read
router.put('/read-all', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date().toISOString();

    if (process.env.DATABASE_URL) {
      await db.run(
        'UPDATE attendance_notifications SET is_read = $1, read_at = $2 WHERE user_id = $3 AND is_read = $4',
        [true, now, userId, false]
      );
    } else {
      await db.run(
        'UPDATE attendance_notifications SET is_read = ?, read_at = ? WHERE user_id = ? AND is_read = ?',
        [1, now, userId, 0]
      );
    }

    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    console.error('Error marking all notifications as read:', err);
    res.status(500).json({ error: 'Failed to mark notifications as read' });
  }
});

// Delete a notification
router.delete('/:notification_id', authenticate, async (req, res) => {
  try {
    const { notification_id } = req.params;

    if (process.env.DATABASE_URL) {
      await db.run('DELETE FROM attendance_notifications WHERE id = $1', [notification_id]);
    } else {
      await db.run('DELETE FROM attendance_notifications WHERE id = ?', [notification_id]);
    }

    res.json({ message: 'Notification deleted' });
  } catch (err) {
    console.error('Error deleting notification:', err);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

// Get unread notification count
router.get('/count/unread', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    let count;
    if (process.env.DATABASE_URL) {
      const result = await db.get(
        'SELECT COUNT(*) as count FROM attendance_notifications WHERE user_id = $1 AND is_read = $2',
        [userId, false]
      );
      count = result.count;
    } else {
      const result = await db.get(
        'SELECT COUNT(*) as count FROM attendance_notifications WHERE user_id = ? AND is_read = ?',
        [userId, 0]
      );
      count = result.count;
    }

    res.json({ unread_count: count });
  } catch (err) {
    console.error('Error fetching unread count:', err);
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
});

module.exports = router;
module.exports.createNotification = createNotification;
