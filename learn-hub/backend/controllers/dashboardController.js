import { getPool } from '../config/database.js';
import sql from 'mssql';

export const getDashboardStats = async (req, res) => {
  const pool = getPool();
  const userId = req.user.id;

  try {
    const statsResult = await pool.request()
      .input('userId', sql.UniqueIdentifier, userId)
      .query(`
        SELECT 
          us.hours_learned,
          us.courses_completed,
          us.courses_enrolled,
          us.current_streak,
          us.longest_streak,
          us.xp_points,
          us.certificates_earned
        FROM UserStats us
        WHERE us.user_id = @userId
      `);

    const stats = statsResult.recordset[0] || {
      hours_learned: 0,
      courses_completed: 0,
      courses_enrolled: 0,
      current_streak: 0,
      longest_streak: 0,
      xp_points: 0,
      certificates_earned: 0
    };

    res.json({
      success: true,
      data: {
        hoursLearned: stats.hours_learned || 0,
        coursesCompleted: stats.courses_completed || 0,
        coursesEnrolled: stats.courses_enrolled || 0,
        currentStreak: stats.current_streak || 0,
        longestStreak: stats.longest_streak || 0,
        xpPoints: stats.xp_points || 0,
        certificatesEarned: stats.certificates_earned || 0
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch dashboard stats' 
    });
  }
};

export const getEnrolledCourses = async (req, res) => {
  const pool = getPool();
  const userId = req.user.id;

  try {
    const result = await pool.request()
      .input('userId', sql.UniqueIdentifier, userId)
      .query(`
        SELECT 
          c.id, c.title, c.thumbnail_url, c.price, c.rating,
          c.duration_hours, c.lessons_count,
          e.status, e.enrolled_at, e.progress_percentage,
          u.name as instructor_name
        FROM Enrollments e
        INNER JOIN Courses c ON e.course_id = c.id
        LEFT JOIN Users u ON c.instructor_id = u.id
        WHERE e.user_id = @userId
        ORDER BY e.enrolled_at DESC
      `);

    res.json({
      success: true,
      data: result.recordset
    });
  } catch (error) {
    console.error('Get enrolled courses error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch enrolled courses' 
    });
  }
};

export const enrollInCourse = async (req, res) => {
  const pool = getPool();
  const userId = req.user.id;
  const { courseId } = req.body;

  try {
    // Check if already enrolled
    const existing = await pool.request()
      .input('userId', sql.UniqueIdentifier, userId)
      .input('courseId', sql.UniqueIdentifier, courseId)
      .query('SELECT id FROM Enrollments WHERE user_id = @userId AND course_id = @courseId');

    if (existing.recordset.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Already enrolled in this course' 
      });
    }

    const enrollmentId = crypto.randomUUID();

    await pool.request()
      .input('id', sql.UniqueIdentifier, enrollmentId)
      .input('userId', sql.UniqueIdentifier, userId)
      .input('courseId', sql.UniqueIdentifier, courseId)
      .query(`
        INSERT INTO Enrollments (id, user_id, course_id, status)
        VALUES (@id, @userId, @courseId, 'active')
      `);

    // Update user stats
    await pool.request()
      .input('userId', sql.UniqueIdentifier, userId)
      .query(`
        UPDATE UserStats 
        SET courses_enrolled = courses_enrolled + 1,
            updated_at = GETDATE()
        WHERE user_id = @userId
      `);

    // Update course student count
    await pool.request()
      .input('courseId', sql.UniqueIdentifier, courseId)
      .query(`
        UPDATE Courses 
        SET student_count = student_count + 1
        WHERE id = @courseId
      `);

    res.json({
      success: true,
      message: 'Successfully enrolled in course'
    });
  } catch (error) {
    console.error('Enroll error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to enroll in course' 
    });
  }
};

import crypto from 'crypto';