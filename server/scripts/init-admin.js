// Script to initialize first admin user
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const db = process.env.DATABASE_URL ? require('../database-postgres') : require('../database');

const initializeAdmin = async () => {
  try {
    // Initialize database first
    await db.initialize();

    // Check if admin already exists
    const existingAdmin = await db.get('SELECT id FROM users WHERE role = ?', ['admin']);

    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    // Create default admin user
    const adminId = uuidv4();
    const adminEmail = 'admin@attendance.local';
    const adminPassword = 'Admin@123456'; // Change this!
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    await db.run(
      'INSERT INTO users (id, username, email, password_hash, role, is_active) VALUES (?, ?, ?, ?, ?, ?)',
      [adminId, 'admin', adminEmail, passwordHash, 'admin', 1]
    );

    console.log('✅ Admin user created successfully!');
    console.log('');
    console.log('Default Admin Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Email:    ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('⚠️  IMPORTANT: Change this password immediately after first login!');
    console.log('');

    process.exit(0);
  } catch (err) {
    console.error('Error initializing admin:', err);
    process.exit(1);
  }
};

initializeAdmin();
