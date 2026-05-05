import { getPool } from '../config/database.js';
import sql from 'mssql';

export const getAdminStats = async (req, res) => {
  const pool = getPool();

  try {
    const [users, courses, revenue, completion] = await Promise.all([
      pool.request().query('SELECT COUNT(*) as total FROM Users WHERE role = \'student\''),
      pool.request().query('SELECT COUNT(*) as total FROM Courses WHERE status = \'published\''),
      pool.request().query(`
        SELECT ISNULL(SUM(price * student_count), 0) as total 
        FROM Courses WHERE status = 'published'
      `),
      pool.request().query(`
        SELECT ISNULL(AVG(progress_percentage), 0) as avg_progress
        FROM Enrollments WHERE status = 'active'
      `)
    ]);

    res.json({
      success: true,
      data: {
        totalStudents: users.recordset[0].total,
        activeCourses: courses.recordset[0].total,
        monthlyRevenue: revenue.recordset[0].total,
        completionRate: completion.recordset[0].avg_progress
      }
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch admin stats' 
    });
  }
};

export const getAllUsers = async (req, res) => {
  const pool = getPool();
  const { page = 1, limit = 20, search, role } = req.query;
  const offset = (page - 1) * limit;

  try {
    let query = `
      SELECT id, name, email, role, is_active, created_at, last_login
      FROM Users
      WHERE 1=1
    `;

    let countQuery = 'SELECT COUNT(*) as total FROM Users WHERE 1=1';
    const request = pool.request();

    if (role) {
      query += ' AND role = @role';
      countQuery += ' AND role = @role';
      request.input('role', sql.NVarChar, role);
    }

    if (search) {
      query += ' AND (name LIKE @search OR email LIKE @search)';
      countQuery += ' AND (name LIKE @search OR email LIKE @search)';
      request.input('search', sql.NVarChar, `%${search}%`);
    }

    query += ` ORDER BY created_at DESC OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`;
    request.input('offset', sql.Int, offset);
    request.input('limit', sql.Int, parseInt(limit));

    const [usersResult, countResult] = await Promise.all([
      request.query(query),
      pool.request()
        .input('role', sql.NVarChar, role || null)
        .input('search', sql.NVarChar, search ? `%${search}%` : null)
        .query(countQuery)
    ]);

    res.json({
      success: true,
      data: usersResult.recordset,
      meta: {
        total: countResult.recordset[0].total,
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch users' 
    });
  }
};

export const updateUserRole = async (req, res) => {
  const pool = getPool();
  const { userId } = req.params;
  const { role } = req.body;

  try {
    await pool.request()
      .input('userId', sql.UniqueIdentifier, userId)
      .input('role', sql.NVarChar, role)
      .query('UPDATE Users SET role = @role, updated_at = GETDATE() WHERE id = @userId');

    res.json({
      success: true,
      message: 'User role updated successfully'
    });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update user role' 
    });
  }
};