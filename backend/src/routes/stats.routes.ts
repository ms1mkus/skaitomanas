import { FastifyInstance } from 'fastify';
import { StatsController } from '../controllers/StatsController';
import { requireAuth } from '../auth/guards';

export async function statsRoutes(
  fastify: FastifyInstance,
  statsController: StatsController
): Promise<void> {
  fastify.get(
    '/authors/:authorId/stats',
    {
      schema: {
        tags: ['Stats'],
        description: 'Gauti autoriaus statistiką',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['authorId'],
          properties: {
            authorId: { type: 'string', format: 'uuid' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              data: { type: 'object', additionalProperties: true },
            },
          },
        },
      },
      preHandler: requireAuth,
    },
    statsController.getAuthorStats.bind(statsController)
  );

  fastify.get(
    '/users/:userId/history',
    {
      schema: {
        tags: ['Stats'],
        description: 'Gauti vartotojo skaitymo istoriją',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['userId'],
          properties: {
            userId: { type: 'string', format: 'uuid' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              data: { type: 'object', additionalProperties: true },
            },
          },
        },
      },
      preHandler: requireAuth,
    },
    statsController.getUserReadingHistory.bind(statsController)
  );
}
