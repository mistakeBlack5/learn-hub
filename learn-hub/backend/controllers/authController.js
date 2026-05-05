import bcrypt from 'bcryptjs';
import { getPool } from '../config/database.js';
import { generateAccessToken, generateRefreshToken } from '../utils/generateToken.js';
import sql from 'mssql';

export const register = async (req, res) => {
  const pool = getPool();
  const { name, email, password, role = 'student' } = req.body;

  console.log('=== REGISTER START ===');
  console.log('Input:', { name, email, role });

  try {
    // 1. Check if user exists
    console.log('Checking for existing user...');
    const existingUser = await pool.request()
      .input('email', sql.NVarChar, email)
      .query('SELECT id FROM Users WHERE email = @email');

    if (existingUser.recordset.length > 0) {
      console.log('User already exists');
      return res.status(400).json({ 
        success: false, 
        message: 'Email already registered' 
      });
    }

    // 2. Hash password
    console.log('Hashing password...');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    console.log('Hash generated:', passwordHash.startsWith('$2a$10$'));

    // 3. Generate UUID
    const userId = crypto.randomUUID();
    console.log('Generated user ID:', userId);

    // 4. INSERT USER - WITH DEBUG LOGGING ✅
    console.log('Attempting to INSERT user...');
    const insertResult = await pool.request()
      .input('id', sql.UniqueIdentifier, userId)
      .input('name', sql.NVarChar, name)
      .input('email', sql.NVarChar, email)
      .input('passwordHash', sql.NVarChar, passwordHash)
      .input('role', sql.NVarChar, role)
      .query(`
        INSERT INTO Users (id, name, email, password_hash, role, is_active, email_verified)
        OUTPUT INSERTED.id
        VALUES (@id, @name, @email, @passwordHash, @role, 1, 0)
      `);
    
    console.log('INSERT result:', insertResult);
    console.log('Rows affected:', insertResult.rowsAffected);

    // 5. Create user stats
    console.log('Creating user stats...');
    await pool.request()
      .input('userId', sql.UniqueIdentifier, userId)
      .query(`INSERT INTO UserStats (user_id) VALUES (@userId)`);

    // 6. Generate tokens
    console.log('Generating tokens...');
    const accessToken = generateAccessToken(userId, role);
    const refreshToken = generateRefreshToken(userId);

    // 7. Store refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await pool.request()
      .input('id', sql.UniqueIdentifier, crypto.randomUUID())
      .input('userId', sql.UniqueIdentifier, userId)
      .input('token', sql.NVarChar, refreshToken)
      .input('expiresAt', sql.DateTime2, expiresAt)
      .query(`
        INSERT INTO RefreshTokens (id, user_id, token, expires_at)
        VALUES (@id, @userId, @token, @expiresAt)
      `);

    console.log('=== REGISTER SUCCESS ===');
    
    // ✅ Send response
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token: accessToken,
      user: {
        id: userId,
        name,
        email,
        role,
        avatar: null,
        joinedDate: new Date().toISOString().split('T')[0]
      }
    });

  } catch (error) {
    // ✅ LOG THE ACTUAL ERROR
    console.error('❌ REGISTER ERROR:', error);
    console.error('Error details:', {
      message: error.message,
      number: error.number,
      state: error.state,
      class: error.class,
      serverName: error.serverName,
      procName: error.procName
    });
    
    res.status(500).json({ 
      success: false, 
      message: 'Registration failed: ' + error.message,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

import crypto from 'crypto';

export const login = async (req, res) => {
  const pool = getPool();
  const { email, password } = req.body;

  try {
    const result = await pool.request()
      .input('email', sql.NVarChar, email)
      .query(`
        SELECT id, name, email, password_hash, role, avatar_url, is_active
        FROM Users 
        WHERE email = @email
      `);

    if (result.recordset.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    const user = result.recordset[0];

    if (!user.is_active) {
      return res.status(403).json({ 
        success: false, 
        message: 'Account is deactivated' 
      });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Update last login
    await pool.request()
      .input('userId', sql.UniqueIdentifier, user.id)
      .query('UPDATE Users SET last_login = GETDATE() WHERE id = @userId');

    // Generate tokens
    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id);

    // Store refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await pool.request()
      .input('id', sql.UniqueIdentifier, crypto.randomUUID())
      .input('userId', sql.UniqueIdentifier, user.id)
      .input('token', sql.NVarChar, refreshToken)
      .input('expiresAt', sql.DateTime2, expiresAt)
      .query(`
        INSERT INTO RefreshTokens (id, user_id, token, expires_at)
        VALUES (@id, @userId, @token, @expiresAt)
      `);

    res.json({
      success: true,
      message: 'Login successful',
      token: accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar_url,
        joinedDate: new Date().toISOString().split('T')[0]
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Login failed' 
    });
  }
};

export const getProfile = async (req, res) => {
  const pool = getPool();

  try {
    const result = await pool.request()
      .input('userId', sql.UniqueIdentifier, req.user.id)
      .query(`
        SELECT u.id, u.name, u.email, u.role, u.avatar_url, u.created_at,
               us.hours_learned, us.courses_completed, us.xp_points, us.current_streak
        FROM Users u
        LEFT JOIN UserStats us ON u.id = us.user_id
        WHERE u.id = @userId
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    const user = result.recordset[0];

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar_url,
        joinedDate: user.created_at.toISOString().split('T')[0],
        stats: {
          hoursLearned: user.hours_learned || 0,
          coursesCompleted: user.courses_completed || 0,
          xpPoints: user.xp_points || 0,
          currentStreak: user.current_streak || 0
        }
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get profile' 
    });
  }
};

export const logout = async (req, res) => {
  const pool = getPool();
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  try {
    // Revoke refresh token
    await pool.request()
      .input('userId', sql.UniqueIdentifier, req.user.id)
      .input('token', sql.NVarChar, token)
      .query(`
        UPDATE RefreshTokens 
        SET is_revoked = 1, revoked_at = GETDATE()
        WHERE user_id = @userId AND token = @token
      `);

    res.json({ 
      success: true, 
      message: 'Logged out successfully' 
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Logout failed' 
    });
  }
};