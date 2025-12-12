import { Pool, PoolConfig } from 'pg';
import { logger } from '../utils/logger';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

let poolConfig: PoolConfig | undefined;
if (connectionString && connectionString.length > 0) {
  poolConfig = {
    connectionString,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  };
} else {
  const host = process.env.DATABASE_HOST || 'localhost';
  const port = process.env.DATABASE_PORT ? Number(process.env.DATABASE_PORT) : 5432;
  const user = process.env.DATABASE_USER;
  let password: unknown = process.env.DATABASE_PASSWORD;
  const database = process.env.DATABASE_NAME || process.env.DATABASE_DB || undefined;

  if (password != null && typeof password !== 'string') {
    password = String(password);
  }

  if (!user || !password || !database) {
    logger.error({ user, database }, 'Missing required database environment variables');
    throw new Error(
      'Database configuration is incomplete. Please set DATABASE_URL or DATABASE_HOST/DATABASE_PORT/DATABASE_USER/DATABASE_PASSWORD/DATABASE_NAME'
    );
  }

  poolConfig = {
    host,
    port,
    user,
    password: password as string,
    database,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  };
}

const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  logger.error({ err }, 'Unexpected database pool error');
});

pool.on('connect', () => {
  logger.debug('New database connection established');
});

export const query = async <T>(text: string, params?: unknown[]): Promise<T[]> => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.debug({ text, duration, rows: result.rowCount }, 'Executed query');
    return result.rows as T[];
  } catch (error) {
    logger.error({ error, text }, 'Database query error');
    throw error;
  }
};

export const getClient = async () => {
  return await pool.connect();
};

export const closePool = async (): Promise<void> => {
  await pool.end();
  logger.info('Database pool closed');
};

export default pool;
