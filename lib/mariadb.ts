import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'zerocall',
  database: process.env.DB_NAME || 'getleads',
  waitForConnections: true,
  connectionLimit: 250,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  connectTimeout: 600000, // 60 seconds
});

export async function query<T = any>(sql: string, params?: any[]): Promise<T[]> {
  const [rows] = await pool.execute(sql, params);
  return rows as T[];
}

export async function queryOne<T = any>(sql: string, params?: any[]): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows[0] || null;
}

export async function insert(sql: string, params?: any[]): Promise<string> {
  const [result] = await pool.execute(sql, params);
  const insertResult = result as any;
  return insertResult.insertId;
}

export default pool;
