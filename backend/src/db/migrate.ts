import * as dotenv from 'dotenv';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import pool from './pool';
import { logger } from '../utils/logger';

dotenv.config();

async function migrate(): Promise<void> {
  const client = await pool.connect();
  try {
    logger.info('Starting database migration...');

    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const { rows: appliedMigrations } = await client.query<{ name: string }>('SELECT name FROM migrations');
    const appliedMigrationNames = new Set(appliedMigrations.map((row) => row.name));

    const migrationsDir = join(__dirname, 'migrations');
    const migrationFiles = readdirSync(migrationsDir)
      .filter((file) => file.endsWith('.sql'))
      .sort();

    for (const file of migrationFiles) {
      if (appliedMigrationNames.has(file)) {
        logger.debug({ file }, 'Migration already applied, skipping');
        continue;
      }

      logger.info({ file }, 'Applying migration');
      const migrationSQL = readFileSync(join(migrationsDir, file), 'utf-8');

      try {
        await client.query('BEGIN');
        await client.query(migrationSQL);
        await client.query('INSERT INTO migrations (name) VALUES ($1)', [file]);
        await client.query('COMMIT');
        logger.info({ file }, 'Migration applied successfully');
      } catch (err) {
        await client.query('ROLLBACK');
        logger.error({ file, err }, 'Migration failed');
        throw err;
      }
    }

    logger.info('All migrations completed successfully');
    process.exit(0);
  } catch (error) {
    console.error(error);
    logger.error({ error }, 'Migration process failed');
    process.exit(1);
  } finally {
    client.release();
  }
}

void migrate();
