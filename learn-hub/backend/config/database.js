import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  port: parseInt(process.env.DB_PORT) || 1433,
  database: process.env.DB_DATABASE,
  options: {
    encrypt: process.env.NODE_ENV === 'production',
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true',
    enableArithAbort: true
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

let pool = null;

export const connectDB = async () => {
  try {
    if (!pool) {
      pool = await sql.connect(config);
      console.log('✅ SQL Server connected successfully');
    }
    return pool;
  } catch (error) {
    console.error('❌ Database connection error:', error);
    throw error;
  }
};

export const getPool = () => {
  if (!pool) {
    throw new Error('Database not initialized. Call connectDB() first');
  }
  return pool;
};

export const closeDB = async () => {
  if (pool) {
    await pool.close();
    console.log('Database connection closed');
  }
};

export default { connectDB, getPool, closeDB };