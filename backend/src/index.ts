import * as dotenv from 'dotenv';
import { createApp } from './app';
import { logger } from './utils/logger';
import { closePool } from './db/pool';

dotenv.config();

const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || '0.0.0.0';

async function start(): Promise<void> {
  try {
    const app = await createApp();

    await app.listen({ port: PORT, host: HOST });

    logger.info(`Server running at http://${HOST}:${PORT}`);
    logger.info(`API Documentation available at http://${HOST}:${PORT}/docs`);

    const shutdown = async (signal: string) => {
      logger.info(`${signal} received, shutting down gracefully`);
      await app.close();
      await closePool();
      process.exit(0);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    logger.error(error, 'Failed to start server');
    process.exit(1);
  }
}

start();
