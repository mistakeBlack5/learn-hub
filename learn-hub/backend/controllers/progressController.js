import { getPool } from '../config/database.js';
import sql from 'mssql';

export const getCourseProgress = async (req, res) => {
  const pool = getPool();
  const { courseId } = req.params;
  const userId = req.user.id; // Only returns progress for the logged-in user

  try {
    // 1. Count total lessons in course
    const lessonsRes = await pool.request()
      .input('courseId', sql.UniqueIdentifier, courseId)
      .query('SELECT COUNT(*) as total FROM Lessons WHERE course_id = @courseId');
    
    const totalLessons = lessonsRes.recordset[0].total || 0;

    // 2. Count completed lessons for THIS user
    const progressRes = await pool.request()
      .input('courseId', sql.UniqueIdentifier, courseId)
      .input('userId', sql.UniqueIdentifier, userId)
      .query(`
        SELECT COUNT(*) as completed 
        FROM Progress p
        INNER JOIN Enrollments e ON p.enrollment_id = e.id
        INNER JOIN Lessons l ON p.lesson_id = l.id
        WHERE e.user_id = @userId 
          AND l.course_id = @courseId 
          AND p.is_completed = 1
      `);

    const completed = progressRes.recordset[0].completed || 0;
    const percentage = totalLessons > 0 ? Math.round((completed / totalLessons) * 100) : 0;

    res.json({ 
      success: true, 
      data: { 
        percentage, 
        completed, 
        totalLessons,
        isEnrolled: completed > 0 || totalLessons > 0 // Simplified enrollment check
      } 
    });
  } catch (error) {
    console.error('Progress fetch error:', error);
    res.status(500).json({ success: false, message: 'Failed to load progress' });
  }
};

// Mark lesson as complete (call when user finishes a lesson)
export const completeLesson = async (req, res) => {
  const pool = getPool();
  const { courseId, lessonId } = req.body;
  const userId = req.user.id;

  try {
    // 1. Get or create enrollment
    let enrollmentRes = await pool.request()
      .input('userId', sql.UniqueIdentifier, userId)
      .input('courseId', sql.UniqueIdentifier, courseId)
      .query('SELECT id FROM Enrollments WHERE user_id = @userId AND course_id = @courseId');

    let enrollmentId;
    if (enrollmentRes.recordset.length === 0) {
      const newEnrollId = crypto.randomUUID();
      await pool.request()
        .input('id', sql.UniqueIdentifier, newEnrollId)
        .input('userId', sql.UniqueIdentifier, userId)
        .input('courseId', sql.UniqueIdentifier, courseId)
        .query('INSERT INTO Enrollments (id, user_id, course_id, status) VALUES (@id, @userId, @courseId, \'active\')');
      enrollmentId = newEnrollId;
    } else {
      enrollmentId = enrollmentRes.recordset[0].id;
    }

    // 2. Insert/update progress record
    await pool.request()
      .input('id', sql.UniqueIdentifier, crypto.randomUUID())
      .input('enrollmentId', sql.UniqueIdentifier, enrollmentId)
      .input('lessonId', sql.UniqueIdentifier, lessonId)
      .query(`
        IF NOT EXISTS (SELECT 1 FROM Progress WHERE enrollment_id = @enrollmentId AND lesson_id = @lessonId)
          INSERT INTO Progress (id, enrollment_id, lesson_id, is_completed, completed_at, last_accessed)
          VALUES (@id, @enrollmentId, @lessonId, 1, GETDATE(), GETDATE())
        ELSE
          UPDATE Progress SET is_completed = 1, completed_at = GETDATE(), last_accessed = GETDATE()
          WHERE enrollment_id = @enrollmentId AND lesson_id = @lessonId
      `);

    res.json({ success: true, message: 'Lesson completed!' });
  } catch (error) {
    console.error('Complete lesson error:', error);
    res.status(500).json({ success: false, message: 'Failed to update progress' });
  }
};

import crypto from 'crypto';