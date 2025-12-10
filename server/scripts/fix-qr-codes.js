// Script to fix QR codes - convert URLs to student IDs
const db = require('../database');

const fixQRCodes = async () => {
  try {
    await db.initialize();
    
    // Wait for database to be ready
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Update all QR codes to use student_id instead of URL
    await db.run(
      'UPDATE students SET qr_code = student_id WHERE qr_code LIKE "http%"'
    );

    console.log('✅ QR codes fixed successfully!');
    console.log('All QR codes now use student_id instead of URLs');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error fixing QR codes:', err);
    process.exit(1);
  }
};

fixQRCodes();
