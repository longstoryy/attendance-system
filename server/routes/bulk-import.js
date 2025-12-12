const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const db = process.env.DATABASE_URL ? require('../database-postgres') : require('../database');
const { authenticate, isAdmin } = require('../middleware/auth');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Bulk import users from CSV
router.post('/users', authenticate, isAdmin, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const results = [];
    const errors = [];
    let rowNumber = 1;

    // Parse CSV
    const csvData = req.file.buffer.toString('utf-8');
    const lines = csvData.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

    // Validate headers
    const requiredHeaders = ['email', 'username', 'password', 'role'];
    const hasRequiredHeaders = requiredHeaders.every(h => headers.includes(h));

    if (!hasRequiredHeaders) {
      return res.status(400).json({
        error: 'Invalid CSV format. Required columns: email, username, password, role'
      });
    }

    // Process each row
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;

      rowNumber = i + 1;
      const values = lines[i].split(',').map(v => v.trim());
      const row = {};

      headers.forEach((header, index) => {
        row[header] = values[index];
      });

      try {
        // Validate required fields
        if (!row.email || !row.username || !row.password || !row.role) {
          errors.push({
            row: rowNumber,
            error: 'Missing required fields (email, username, password, role)'
          });
          continue;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(row.email)) {
          errors.push({
            row: rowNumber,
            error: `Invalid email format: ${row.email}`
          });
          continue;
        }

        // Validate role
        const validRoles = ['admin', 'staff', 'instructor'];
        if (!validRoles.includes(row.role.toLowerCase())) {
          errors.push({
            row: rowNumber,
            error: `Invalid role: ${row.role}. Must be one of: ${validRoles.join(', ')}`
          });
          continue;
        }

        // Check if user already exists
        let existingUser;
        if (process.env.DATABASE_URL) {
          const result = await db.query('SELECT id FROM users WHERE email = $1 OR username = $2', [row.email, row.username]);
          existingUser = result.rows[0];
        } else {
          existingUser = await db.get('SELECT id FROM users WHERE email = ? OR username = ?', [row.email, row.username]);
        }

        if (existingUser) {
          errors.push({
            row: rowNumber,
            error: `User already exists: ${row.email}`
          });
          continue;
        }

        // Hash password
        const passwordHash = await bcrypt.hash(row.password, 10);
        const userId = uuidv4();

        // Insert user
        if (process.env.DATABASE_URL) {
          await db.query(
            'INSERT INTO users (id, username, email, password_hash, role, is_active) VALUES ($1, $2, $3, $4, $5, $6)',
            [userId, row.username, row.email, passwordHash, row.role.toLowerCase(), true]
          );
        } else {
          await db.run(
            'INSERT INTO users (id, username, email, password_hash, role, is_active) VALUES (?, ?, ?, ?, ?, ?)',
            [userId, row.username, row.email, passwordHash, row.role.toLowerCase(), 1]
          );
        }

        results.push({
          email: row.email,
          username: row.username,
          role: row.role.toLowerCase(),
          status: 'success'
        });
      } catch (err) {
        errors.push({
          row: rowNumber,
          error: err.message
        });
      }
    }

    res.json({
      success: true,
      imported: results.length,
      failed: errors.length,
      results,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (err) {
    console.error('Bulk import error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Bulk import students from CSV
router.post('/students', authenticate, isAdmin, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const results = [];
    const errors = [];
    let rowNumber = 1;

    // Parse CSV
    const csvData = req.file.buffer.toString('utf-8');
    const lines = csvData.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

    // Validate headers
    const requiredHeaders = ['name', 'email', 'student_id'];
    const hasRequiredHeaders = requiredHeaders.every(h => headers.includes(h));

    if (!hasRequiredHeaders) {
      return res.status(400).json({
        error: 'Invalid CSV format. Required columns: name, email, student_id'
      });
    }

    // Process each row
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;

      rowNumber = i + 1;
      const values = lines[i].split(',').map(v => v.trim());
      const row = {};

      headers.forEach((header, index) => {
        row[header] = values[index];
      });

      try {
        // Validate required fields
        if (!row.name || !row.email || !row.student_id) {
          errors.push({
            row: rowNumber,
            error: 'Missing required fields (name, email, student_id)'
          });
          continue;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(row.email)) {
          errors.push({
            row: rowNumber,
            error: `Invalid email format: ${row.email}`
          });
          continue;
        }

        // Check if student already exists
        let existingStudent;
        if (process.env.DATABASE_URL) {
          const result = await db.query('SELECT id FROM students WHERE student_id = $1', [row.student_id]);
          existingStudent = result.rows[0];
        } else {
          existingStudent = await db.get('SELECT id FROM students WHERE student_id = ?', [row.student_id]);
        }

        if (existingStudent) {
          errors.push({
            row: rowNumber,
            error: `Student already exists: ${row.student_id}`
          });
          continue;
        }

        // Insert student
        const studentId = uuidv4();
        if (process.env.DATABASE_URL) {
          await db.query(
            'INSERT INTO students (id, name, email, student_id) VALUES ($1, $2, $3, $4)',
            [studentId, row.name, row.email, row.student_id]
          );
        } else {
          await db.run(
            'INSERT INTO students (id, name, email, student_id) VALUES (?, ?, ?, ?)',
            [studentId, row.name, row.email, row.student_id]
          );
        }

        results.push({
          name: row.name,
          email: row.email,
          student_id: row.student_id,
          status: 'success'
        });
      } catch (err) {
        errors.push({
          row: rowNumber,
          error: err.message
        });
      }
    }

    res.json({
      success: true,
      imported: results.length,
      failed: errors.length,
      results,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (err) {
    console.error('Bulk import error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
