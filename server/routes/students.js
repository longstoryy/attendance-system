const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = process.env.DATABASE_URL ? require('../database-postgres') : require('../database');

const router = express.Router();

// Get all students
router.get('/', async (req, res) => {
  try {
    const students = await db.all('SELECT * FROM students ORDER BY name');
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get student by ID
router.get('/:id', async (req, res) => {
  try {
    if (process.env.DATABASE_URL) {
      const student = await db.get('SELECT * FROM students WHERE id = $1', [req.params.id]);
      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }
      res.json(student);
    } else {
      const student = await db.get('SELECT * FROM students WHERE id = ?', [req.params.id]);
      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }
      res.json(student);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create student
router.post('/', async (req, res) => {
  try {
    const { name, email, student_id, class_id } = req.body;

    if (!name || !student_id) {
      return res.status(400).json({ error: 'Name and student_id are required' });
    }

    const id = uuidv4();
    const qr_code = student_id;
    
    if (process.env.DATABASE_URL) {
      await db.run(
        'INSERT INTO students (id, name, email, student_id, class_id, qr_code) VALUES ($1, $2, $3, $4, $5, $6)',
        [id, name, email, student_id, class_id, qr_code]
      );
      const student = await db.get('SELECT * FROM students WHERE id = $1', [id]);
      res.status(201).json(student);
    } else {
      await db.run(
        'INSERT INTO students (id, name, email, student_id, class_id, qr_code) VALUES (?, ?, ?, ?, ?, ?)',
        [id, name, email, student_id, class_id, qr_code]
      );
      const student = await db.get('SELECT * FROM students WHERE id = ?', [id]);
      res.status(201).json(student);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update student
router.put('/:id', async (req, res) => {
  try {
    const { name, email, class_id } = req.body;
    const id = req.params.id;

    if (process.env.DATABASE_URL) {
      await db.run(
        'UPDATE students SET name = $1, email = $2, class_id = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4',
        [name, email, class_id, id]
      );
      const student = await db.get('SELECT * FROM students WHERE id = $1', [id]);
      res.json(student);
    } else {
      await db.run(
        'UPDATE students SET name = ?, email = ?, class_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [name, email, class_id, id]
      );
      const student = await db.get('SELECT * FROM students WHERE id = ?', [id]);
      res.json(student);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete student
router.delete('/:id', async (req, res) => {
  try {
    if (process.env.DATABASE_URL) {
      await db.run('DELETE FROM students WHERE id = $1', [req.params.id]);
    } else {
      await db.run('DELETE FROM students WHERE id = ?', [req.params.id]);
    }
    res.json({ message: 'Student deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get students by class
router.get('/class/:class_id', async (req, res) => {
  try {
    if (process.env.DATABASE_URL) {
      const students = await db.all(
        'SELECT * FROM students WHERE class_id = $1 ORDER BY name',
        [req.params.class_id]
      );
      res.json(students);
    } else {
      const students = await db.all(
        'SELECT * FROM students WHERE class_id = ? ORDER BY name',
        [req.params.class_id]
      );
      res.json(students);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
