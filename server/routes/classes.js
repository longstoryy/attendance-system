const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../database');

const router = express.Router();

// Get all classes
router.get('/', async (req, res) => {
  try {
    const classes = await db.all('SELECT * FROM classes ORDER BY name');
    res.json(classes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get class by ID
router.get('/:id', async (req, res) => {
  try {
    const classData = await db.get('SELECT * FROM classes WHERE id = ?', [req.params.id]);
    if (!classData) {
      return res.status(404).json({ error: 'Class not found' });
    }
    res.json(classData);
  } catch (err) {
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
    await db.run(
      'INSERT INTO classes (id, name, code, instructor, schedule, capacity) VALUES (?, ?, ?, ?, ?, ?)',
      [id, name, code, instructor, schedule, capacity]
    );

    const classData = await db.get('SELECT * FROM classes WHERE id = ?', [id]);
    res.status(201).json(classData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update class
router.put('/:id', async (req, res) => {
  try {
    const { name, code, instructor, schedule, capacity } = req.body;
    const id = req.params.id;

    await db.run(
      'UPDATE classes SET name = ?, code = ?, instructor = ?, schedule = ?, capacity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [name, code, instructor, schedule, capacity, id]
    );

    const classData = await db.get('SELECT * FROM classes WHERE id = ?', [id]);
    res.json(classData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete class
router.delete('/:id', async (req, res) => {
  try {
    await db.run('DELETE FROM classes WHERE id = ?', [req.params.id]);
    res.json({ message: 'Class deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
