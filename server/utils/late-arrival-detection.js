const db = process.env.DATABASE_URL ? require('../database-postgres') : require('../database');

const detectLateArrival = async (studentId, classId, timeIn) => {
  try {
    const now = new Date(timeIn);
    const dayOfWeek = now.getDay();

    let schedule;
    if (process.env.DATABASE_URL) {
      schedule = await db.get(
        `SELECT * FROM class_schedules 
         WHERE class_id = $1 AND day_of_week = $2`,
        [classId, dayOfWeek]
      );
    } else {
      schedule = await db.get(
        `SELECT * FROM class_schedules 
         WHERE class_id = ? AND day_of_week = ?`,
        [classId, dayOfWeek]
      );
    }

    if (!schedule) {
      return { isLate: false, reason: 'No schedule found for this class on this day' };
    }

    const startTime = new Date(timeIn);
    const [startHour, startMinute] = schedule.start_time.split(':');
    startTime.setHours(parseInt(startHour), parseInt(startMinute), 0, 0);

    const lateThresholdMs = schedule.late_threshold_minutes * 60 * 1000;
    const lateTime = new Date(startTime.getTime() + lateThresholdMs);

    const isLate = now > lateTime;

    return {
      isLate,
      scheduleStartTime: schedule.start_time,
      lateThresholdMinutes: schedule.late_threshold_minutes,
      actualArrivalTime: now.toISOString()
    };
  } catch (err) {
    console.error('Error detecting late arrival:', err);
    return { isLate: false, error: err.message };
  }
};

const createLateArrivalNotification = async (userId, attendanceId, studentName) => {
  try {
    const { createNotification } = require('../routes/notifications');
    await createNotification(
      userId,
      'late_arrival',
      `${studentName} arrived late to class`,
      attendanceId,
      null
    );
  } catch (err) {
    console.error('Error creating late arrival notification:', err);
  }
};

module.exports = {
  detectLateArrival,
  createLateArrivalNotification
};
