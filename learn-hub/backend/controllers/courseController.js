import { getPool } from '../config/database.js';
import sql from 'mssql';

export const getCourses = async (req, res) => {
  const pool = getPool();
  const { 
    category, 
    search, 
    level, 
    minPrice, 
    maxPrice, 
    status = 'published',
    page = 1, 
    limit = 12 
  } = req.query;

  const offset = (page - 1) * limit;

  try {
    let query = `
      SELECT 
        c.id, c.title, c.description, c.thumbnail_url, c.price, c.rating,
        c.student_count, c.duration_hours, c.lessons_count, c.level,
        cat.name as category_name, cat.icon as category_icon,
        u.name as instructor_name, u.avatar_url as instructor_avatar
      FROM Courses c
      LEFT JOIN Categories cat ON c.category_id = cat.id
      LEFT JOIN Users u ON c.instructor_id = u.id
      WHERE 1=1
    `;

    let countQuery = 'SELECT COUNT(*) as total FROM Courses c WHERE 1=1';

    const request = pool.request();

    if (status) {
      query += ' AND c.status = @status';
      countQuery += ' AND c.status = @status';
      request.input('status', sql.NVarChar, status);
    }

    if (category) {
      query += ' AND cat.name = @category';
      countQuery += ' AND cat.name = @category';
      request.input('category', sql.NVarChar, category);
    }

    if (level) {
      query += ' AND c.level = @level';
      countQuery += ' AND c.level = @level';
      request.input('level', sql.NVarChar, level);
    }

    if (search) {
      query += ' AND (c.title LIKE @search OR c.description LIKE @search)';
      countQuery += ' AND (c.title LIKE @search OR c.description LIKE @search)';
      request.input('search', sql.NVarChar, `%${search}%`);
    }

    if (minPrice) {
      query += ' AND c.price >= @minPrice';
      countQuery += ' AND c.price >= @minPrice';
      request.input('minPrice', sql.Decimal, minPrice);
    }

    if (maxPrice) {
      query += ' AND c.price <= @maxPrice';
      countQuery += ' AND c.price <= @maxPrice';
      request.input('maxPrice', sql.Decimal, maxPrice);
    }

    query += ` ORDER BY c.created_at DESC OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`;
    request.input('offset', sql.Int, offset);
    request.input('limit', sql.Int, parseInt(limit));

    const [coursesResult, countResult] = await Promise.all([
      request.query(query),
      pool.request()
        .input('status', sql.NVarChar, status)
        .input('category', sql.NVarChar, category || null)
        .input('level', sql.NVarChar, level || null)
        .input('search', sql.NVarChar, search ? `%${search}%` : null)
        .input('minPrice', sql.Decimal, minPrice || 0)
        .input('maxPrice', sql.Decimal, maxPrice || 999999)
        .query(countQuery)
    ]);

    res.json({
      success: true,
      data: coursesResult.recordset,
      meta: {
        total: countResult.recordset[0].total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(countResult.recordset[0].total / limit)
      }
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch courses' 
    });
  }
};

export const getCourseById = async (req, res) => {
  const pool = getPool();
  const { id } = req.params;

  try {
    const courseResult = await pool.request()
      .input('id', sql.UniqueIdentifier, id)
      .query(`
        SELECT 
          c.*, 
          cat.name as category_name,
          u.name as instructor_name,
          u.avatar_url as instructor_avatar
        FROM Courses c
        LEFT JOIN Categories cat ON c.category_id = cat.id
        LEFT JOIN Users u ON c.instructor_id = u.id
        WHERE c.id = @id
      `);

    if (courseResult.recordset.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Course not found' 
      });
    }

    const lessonsResult = await pool.request()
      .input('courseId', sql.UniqueIdentifier, id)
      .query(`
        SELECT id, title, type, duration_minutes, order_index, is_free
        FROM Lessons
        WHERE course_id = @courseId
        ORDER BY order_index
      `);

    res.json({
      success: true,
      data: {
        ...courseResult.recordset[0],
        lessons: lessonsResult.recordset
      }
    });
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch course' 
    });
  }
};

export const createCourse = async (req, res) => {
  const pool = getPool();
  const { 
    title, description, thumbnail_url, category_id, 
    price, level, duration_hours 
  } = req.body;

  try {
    const courseId = crypto.randomUUID();

    await pool.request()
      .input('id', sql.UniqueIdentifier, courseId)
      .input('title', sql.NVarChar, title)
      .input('description', sql.NVarChar, description)
      .input('thumbnailUrl', sql.NVarChar, thumbnail_url)
      .input('categoryId', sql.UniqueIdentifier, category_id)
      .input('instructorId', sql.UniqueIdentifier, req.user.id)
      .input('price', sql.Decimal, price || 0)
      .input('level', sql.NVarChar, level || 'beginner')
      .input('durationHours', sql.Int, duration_hours || 0)
      .query(`
        INSERT INTO Courses 
        (id, title, description, thumbnail_url, category_id, instructor_id, 
         price, level, duration_hours, status)
        VALUES 
        (@id, @title, @description, @thumbnailUrl, @categoryId, @instructorId,
         @price, @level, @durationHours, 'draft')
      `);

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      courseId
    });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create course' 
    });
  }
};

import crypto from 'crypto';