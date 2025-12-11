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
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);

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

    await db.run(
      'INSERT INTO user_sessions (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)',
      [sessionId, user.id, token, expiresAt]
    );

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
      await db.run('DELETE FROM user_sessions WHERE token = ?', [token]);
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
    const user = await db.get('SELECT id, email, username, role FROM users WHERE id = ?', [req.user.userId]);

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
    const user = await db.get('SELECT id, role FROM users WHERE id = ?', [req.user.userId]);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate new token
    const newToken = generateToken(user.id, user.role);

    // Update session
    const oldToken = req.headers.authorization?.split(' ')[1];
    const expiresAt = new Date(Date.now() + 3600000).toISOString();

    await db.run(
      'UPDATE user_sessions SET token = ?, expires_at = ? WHERE token = ?',
      [newToken, expiresAt, oldToken]
    );

    res.json({ token: newToken });
  } catch (err) {
    console.error('Refresh token error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
