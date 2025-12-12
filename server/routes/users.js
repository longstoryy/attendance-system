const express = require('express');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const db = process.env.DATABASE_URL ? require('../database-postgres') : require('../database');
const { authenticate, isAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all users (admin only)
router.get('/', authenticate, isAdmin, async (req, res) => {
  try {
    const users = await db.all(
      'SELECT id, username, email, role, is_active, created_at FROM users ORDER BY created_at DESC',
      []
    );

    res.json(users || []);
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get user by ID (admin or self)
router.get('/:id', authenticate, async (req, res) => {
  try {
    // Allow user to view their own profile or admin to view any
    if (req.user.userId !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (process.env.DATABASE_URL) {
      const user = await db.get(
        'SELECT id, username, email, role, is_active, created_at FROM users WHERE id = $1',
        [req.params.id]
      );

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(user);
    } else {
      const user = await db.get(
        'SELECT id, username, email, role, is_active, created_at FROM users WHERE id = ?',
        [req.params.id]
      );

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(user);
    }
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Create user (admin only)
router.post('/', authenticate, isAdmin, async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password required' });
    }

    if (!['admin', 'instructor', 'staff', 'student'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const id = uuidv4();

    if (process.env.DATABASE_URL) {
      await db.run(
        'INSERT INTO users (id, username, email, password_hash, role) VALUES ($1, $2, $3, $4, $5)',
        [id, username, email, passwordHash, role]
      );

      const user = await db.get(
        'SELECT id, username, email, role, is_active, created_at FROM users WHERE id = $1',
        [id]
      );

      res.status(201).json(user);
    } else {
      await db.run(
        'INSERT INTO users (id, username, email, password_hash, role) VALUES (?, ?, ?, ?, ?)',
        [id, username, email, passwordHash, role]
      );

      const user = await db.get(
        'SELECT id, username, email, role, is_active, created_at FROM users WHERE id = ?',
        [id]
      );

      res.status(201).json(user);
    }
  } catch (err) {
    console.error('Create user error:', err);
    if (err.message.includes('UNIQUE')) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }
    res.status(500).json({ error: err.message });
  }
});

// Update user (admin only)
router.put('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const { username, email, role, is_active } = req.body;

    if (role && !['admin', 'instructor', 'staff', 'student'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const updates = [];
    const values = [];

    if (username !== undefined) {
      updates.push('username = ?');
      values.push(username);
    }
    if (email !== undefined) {
      updates.push('email = ?');
      values.push(email);
    }
    if (role !== undefined) {
      updates.push('role = ?');
      values.push(role);
    }
    if (is_active !== undefined) {
      updates.push('is_active = ?');
      values.push(is_active ? 1 : 0);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(req.params.id);

    await db.run(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    const user = await db.get(
      'SELECT id, username, email, role, is_active, created_at FROM users WHERE id = ?',
      [req.params.id]
    );

    res.json(user);
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Delete user (admin only)
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    if (req.params.id === req.user.userId) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    if (process.env.DATABASE_URL) {
      await db.run('DELETE FROM users WHERE id = $1', [req.params.id]);
    } else {
      await db.run('DELETE FROM users WHERE id = ?', [req.params.id]);
    }

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Reset password (admin only)
router.post('/:id/reset-password', authenticate, isAdmin, async (req, res) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ error: 'New password required' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    if (process.env.DATABASE_URL) {
      await db.run(
        'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [passwordHash, req.params.id]
      );
    } else {
      await db.run(
        'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [passwordHash, req.params.id]
      );
    }

    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
