import * as dotenv from 'dotenv';
import { writeFileSync } from 'fs';
import { createApp } from '../src/app';
import { logger } from '../src/utils/logger';

dotenv.config();

async function exportOpenAPI(): Promise<void> {
  try {
    const app = await createApp();
    await app.ready();

    const swagger = app.swagger();
    const yaml = JSON.stringify(swagger, null, 2);

    writeFileSync('openapi.yaml', yaml);
    logger.info('OpenAPI spec exported to openapi.yaml');

    await app.close();
    process.exit(0);
  } catch (error) {
    logger.error(error, 'Failed to export OpenAPI spec');
    process.exit(1);
  }
}

exportOpenAPI();


