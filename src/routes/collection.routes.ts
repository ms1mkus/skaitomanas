import { FastifyInstance } from 'fastify';
import { CollectionController } from '../controllers/CollectionController';
import { requireAuth } from '../auth/guards';

export async function collectionRoutes(
  fastify: FastifyInstance,
  collectionController: CollectionController
): Promise<void> {
  fastify.get(
    '/:userId/collections',
    {
      schema: {
        tags: ['Collections'],
        description: 'Gauti vartotojo mėgstamų knygų sąrašą',
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
    },
    collectionController.getUserCollections.bind(collectionController)
  );

  fastify.post(
    '/:userId/collections',
    {
      schema: {
        tags: ['Collections'],
        description: 'Pridėti knygą į mėgstamiausias',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['userId'],
          properties: {
            userId: { type: 'string', format: 'uuid' },
          },
        },
        body: {
          type: 'object',
          required: ['book_id'],
          properties: {
            book_id: { type: 'string', format: 'uuid' },
          },
        },
        response: {
          201: {
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
    collectionController.addToCollection.bind(collectionController)
  );

  fastify.delete(
    '/:userId/collections/:bookId',
    {
      schema: {
        tags: ['Collections'],
        description: 'Pašalinti knygą iš mėgstamiausių',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['userId', 'bookId'],
          properties: {
            userId: { type: 'string', format: 'uuid' },
            bookId: { type: 'string', format: 'uuid' },
          },
        },
        response: {
          204: {
            type: 'null',
          },
        },
      },
      preHandler: requireAuth,
    },
    collectionController.removeFromCollection.bind(collectionController)
  );
}
