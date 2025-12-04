import * as dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';
import pool from './pool';
import { logger } from '../utils/logger';

dotenv.config();

async function migrate(): Promise<void> {
  try {
    logger.info('Starting database migration...');

    const schemaSQL = readFileSync(join(__dirname, 'schema.sql'), 'utf-8');

    await pool.query(schemaSQL);

    logger.info('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.log(error);
    logger.error({ error }, 'Migration failed');
    process.exit(1);
  }
}

migrate();
