import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

const config = {
  server: process.env.DB_SERVER,
  port: parseInt(process.env.DB_PORT) || 1433,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,

  options: {
    encrypt: true,
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true',
  },
};

export const connectDB = async () => {
  try {
    await sql.connect(config);
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

export const closeDB = async () => {
  await sql.close();
};