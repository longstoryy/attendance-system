const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = process.env.DATABASE_URL ? require('../database-postgres') : require('../database');

const router = express.Router();

// Get all classes
router.get('/', async (req, res) => {
  try {
    const classes = await db.all('SELECT * FROM classes ORDER BY name');
    res.json(classes);
  } catch (err) {
    console.error('Error fetching classes:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get class by ID
router.get('/:id', async (req, res) => {
  try {
    if (process.env.DATABASE_URL) {
      const classData = await db.get('SELECT * FROM classes WHERE id = $1', [req.params.id]);
      if (!classData) {
        return res.status(404).json({ error: 'Class not found' });
      }
      res.json(classData);
    } else {
      const classData = await db.get('SELECT * FROM classes WHERE id = ?', [req.params.id]);
      if (!classData) {
        return res.status(404).json({ error: 'Class not found' });
      }
      res.json(classData);
    }
  } catch (err) {
    console.error('Error fetching class:', err);
    res.status(500).json({ error: err.message });
  }
});

// Create class
router.post('/', async (req, res) => {
  try {
    const { name, code, instructor, schedule, capacity } = req.body;

    if (!name || !code) {
      return res.status(400).json({ error: 'Name and code are required' });
    }

    const id = uuidv4();
    
    if (process.env.DATABASE_URL) {
      await db.run(
        'INSERT INTO classes (id, name, code, instructor, schedule, capacity) VALUES ($1, $2, $3, $4, $5, $6)',
        [id, name, code, instructor, schedule, capacity]
      );
      const classData = await db.get('SELECT * FROM classes WHERE id = $1', [id]);
      res.status(201).json(classData);
    } else {
      await db.run(
        'INSERT INTO classes (id, name, code, instructor, schedule, capacity) VALUES (?, ?, ?, ?, ?, ?)',
        [id, name, code, instructor, schedule, capacity]
      );
      const classData = await db.get('SELECT * FROM classes WHERE id = ?', [id]);
      res.status(201).json(classData);
    }
  } catch (err) {
    console.error('Error creating class:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update class
router.put('/:id', async (req, res) => {
  try {
    const { name, code, instructor, schedule, capacity } = req.body;
    const id = req.params.id;

    if (process.env.DATABASE_URL) {
      await db.run(
        'UPDATE classes SET name = $1, code = $2, instructor = $3, schedule = $4, capacity = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6',
        [name, code, instructor, schedule, capacity, id]
      );
      const classData = await db.get('SELECT * FROM classes WHERE id = $1', [id]);
      res.json(classData);
    } else {
      await db.run(
        'UPDATE classes SET name = ?, code = ?, instructor = ?, schedule = ?, capacity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [name, code, instructor, schedule, capacity, id]
      );
      const classData = await db.get('SELECT * FROM classes WHERE id = ?', [id]);
      res.json(classData);
    }
  } catch (err) {
    console.error('Error updating class:', err);
    res.status(500).json({ error: err.message });
  }
});

// Delete class
router.delete('/:id', async (req, res) => {
  try {
    if (process.env.DATABASE_URL) {
      await db.run('DELETE FROM classes WHERE id = $1', [req.params.id]);
    } else {
      await db.run('DELETE FROM classes WHERE id = ?', [req.params.id]);
    }
    res.json({ message: 'Class deleted' });
  } catch (err) {
    console.error('Error deleting class:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
