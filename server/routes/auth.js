const express = require('express');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const db = process.env.DATABASE_URL ? require('../database-postgres') : require('../database');
const { generateToken, authenticate } = require('../middleware/auth');

const router = express.Router();

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Find user by email
    let user;
    if (process.env.DATABASE_URL) {
      // PostgreSQL
      const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
      user = result.rows[0];
    } else {
      // SQLite
      user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (!user.is_active) {
      return res.status(401).json({ error: 'Account is inactive' });
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken(user.id, user.role);

    // Store session
    const sessionId = uuidv4();
    const expiresAt = new Date(Date.now() + 3600000).toISOString(); // 1 hour

    if (process.env.DATABASE_URL) {
      // PostgreSQL
      await db.query(
        'INSERT INTO user_sessions (id, user_id, token, expires_at) VALUES ($1, $2, $3, $4)',
        [sessionId, user.id, token, expiresAt]
      );
    } else {
      // SQLite
      await db.run(
        'INSERT INTO user_sessions (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)',
        [sessionId, user.id, token, expiresAt]
      );
    }

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Logout endpoint
router.post('/logout', authenticate, async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (token) {
      if (process.env.DATABASE_URL) {
        // PostgreSQL
        await db.query('DELETE FROM user_sessions WHERE token = $1', [token]);
      } else {
        // SQLite
        await db.run('DELETE FROM user_sessions WHERE token = ?', [token]);
      }
    }

    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get current user
router.get('/me', authenticate, async (req, res) => {
  try {
    let user;
    if (process.env.DATABASE_URL) {
      // PostgreSQL
      const result = await db.query('SELECT id, email, username, role FROM users WHERE id = $1', [req.user.userId]);
      user = result.rows[0];
    } else {
      // SQLite
      user = await db.get('SELECT id, email, username, role FROM users WHERE id = ?', [req.user.userId]);
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Refresh token
router.post('/refresh', authenticate, async (req, res) => {
  try {
    let user;
    if (process.env.DATABASE_URL) {
      // PostgreSQL
      const result = await db.query('SELECT id, role FROM users WHERE id = $1', [req.user.userId]);
      user = result.rows[0];
    } else {
      // SQLite
      user = await db.get('SELECT id, role FROM users WHERE id = ?', [req.user.userId]);
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate new token
    const newToken = generateToken(user.id, user.role);

    // Update session
    const oldToken = req.headers.authorization?.split(' ')[1];
    const expiresAt = new Date(Date.now() + 3600000).toISOString();

    if (process.env.DATABASE_URL) {
      // PostgreSQL
      await db.query(
        'UPDATE user_sessions SET token = $1, expires_at = $2 WHERE token = $3',
        [newToken, expiresAt, oldToken]
      );
    } else {
      // SQLite
      await db.run(
        'UPDATE user_sessions SET token = ?, expires_at = ? WHERE token = ?',
        [newToken, expiresAt, oldToken]
      );
    }

    res.json({ token: newToken });
  } catch (err) {
    console.error('Refresh token error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Initialize admin user (one-time setup endpoint)
router.post('/init-admin', async (req, res) => {
  try {
    // Check if admin already exists
    let existingAdmin;
    if (process.env.DATABASE_URL) {
      // PostgreSQL
      const result = await db.query('SELECT id FROM users WHERE role = $1', ['admin']);
      existingAdmin = result.rows[0];
    } else {
      // SQLite
      existingAdmin = await db.get('SELECT id FROM users WHERE role = ?', ['admin']);
    }

    if (existingAdmin) {
      return res.status(400).json({ error: 'Admin user already exists' });
    }

    // Create default admin user
    const adminId = uuidv4();
    const adminEmail = 'admin@attendance.local';
    const adminPassword = 'Admin@123456';
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    if (process.env.DATABASE_URL) {
      // PostgreSQL
      await db.query(
        'INSERT INTO users (id, username, email, password_hash, role, is_active) VALUES ($1, $2, $3, $4, $5, $6)',
        [adminId, 'admin', adminEmail, passwordHash, 'admin', true]
      );
    } else {
      // SQLite
      await db.run(
        'INSERT INTO users (id, username, email, password_hash, role, is_active) VALUES (?, ?, ?, ?, ?, ?)',
        [adminId, 'admin', adminEmail, passwordHash, 'admin', 1]
      );
    }

    res.json({
      success: true,
      message: 'Admin user created successfully',
      email: adminEmail,
      password: adminPassword
    });
  } catch (err) {
    console.error('Admin initialization error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
