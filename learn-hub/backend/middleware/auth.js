import { verifyToken } from '../utils/generateToken.js';
import { getPool } from '../config/database.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access token required' 
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid or expired token' 
      });
    }

    // Verify user still exists and is active
    const pool = getPool();
    const result = await pool.request()
      .input('userId', sql.UniqueIdentifier, decoded.userId)
      .query('SELECT id, email, role, is_active FROM Users WHERE id = @userId');

    if (result.recordset.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    if (!result.recordset[0].is_active) {
      return res.status(403).json({ 
        success: false, 
        message: 'Account deactivated' 
      });
    }

    req.user = {
      id: result.recordset[0].id,
      email: result.recordset[0].email,
      role: result.recordset[0].role
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Authentication failed' 
    });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Insufficient permissions' 
      });
    }
    next();
  };
};

import sql from 'mssql';