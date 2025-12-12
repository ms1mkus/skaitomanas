import { FastifyInstance } from 'fastify';
import { BookController } from '../controllers/BookController';
import { requireAuth, requireRole } from '../auth/guards';
import { UserRole } from '../models';
import { createBookSchema, updateBookSchema, bookQuerySchema } from '../schemas/book.schema';

export async function bookRoutes(
  fastify: FastifyInstance,
  bookController: BookController
): Promise<void> {
  fastify.get(
    '/',
    {
      schema: {
        tags: ['Books'],
        description: 'Gauti knygų sąrašą su filtrais',
        querystring: {
          type: 'object',
          properties: {
            tag: { type: 'string' },
            author: { type: 'string' },
            language: { type: 'string' },
            limit: { type: 'number', default: 20 },
            offset: { type: 'number', default: 0 },
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
      preHandler: async (request, _reply) => {
        bookQuerySchema.parse(request.query);
      },
    },
    bookController.getBooks.bind(bookController)
  );

  fastify.get(
    '/my-books',
    {
      schema: {
        tags: ['Books'],
        description: 'Gauti prisijungusio autoriaus knygas (įskaitant juodraščius)',
        security: [{ bearerAuth: [] }],
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
      preHandler: [requireAuth, requireRole([UserRole.AUTHOR, UserRole.ADMIN])],
    },
    bookController.getMyBooks.bind(bookController)
  );

  fastify.get(
    '/:bookId',
    {
      schema: {
        tags: ['Books'],
        description: 'Gauti knygos detales su skyrių sąrašu',
        params: {
          type: 'object',
          required: ['bookId'],
          properties: {
            bookId: { type: 'string', format: 'uuid' },
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
    bookController.getBookById.bind(bookController)
  );

  fastify.post('/', {
    schema: {
      tags: ['Books'],
      description: 'Sukurti naują knygą (tik autoriams)',
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['title', 'description'],
        properties: {
          title: { type: 'string', minLength: 1, maxLength: 500 },
          description: { type: 'string' },
          cover_image_url: { type: 'string', format: 'uri' },
          language: { type: 'string', default: 'lt' },
          tags: { type: 'array', items: { type: 'string' } },
          status: { type: 'string', enum: ['draft', 'published'] },
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
    preHandler: [requireAuth, requireRole([UserRole.AUTHOR, UserRole.ADMIN])],
    handler: async (request, reply) => {
      createBookSchema.parse(request.body);
      await bookController.createBook(request, reply);
    },
  });

  fastify.patch('/:bookId', {
    schema: {
      tags: ['Books'],
      description: 'Atnaujinti knygą (tik autorius)',
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        required: ['bookId'],
        properties: {
          bookId: { type: 'string', format: 'uuid' },
        },
      },
      body: {
        type: 'object',
        properties: {
          title: { type: 'string', minLength: 1, maxLength: 500 },
          description: { type: 'string' },
          cover_image_url: { type: 'string', format: 'uri' },
          language: { type: 'string' },
          tags: { type: 'array', items: { type: 'string' } },
          status: { type: 'string', enum: ['draft', 'published'] },
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
    preHandler: [requireAuth, requireRole([UserRole.AUTHOR, UserRole.ADMIN])],
    handler: async (request, reply) => {
      updateBookSchema.parse(request.body);
      await bookController.updateBook(request, reply);
    },
  });

  fastify.delete(
    '/:bookId',
    {
      schema: {
        tags: ['Books'],
        description: 'Ištrinti knygą (tik autorius)',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['bookId'],
          properties: {
            bookId: { type: 'string', format: 'uuid' },
          },
        },
        response: {
          204: {
            type: 'null',
          },
        },
      },
      preHandler: [requireAuth, requireRole([UserRole.AUTHOR, UserRole.ADMIN])],
    },
    bookController.deleteBook.bind(bookController)
  );

  fastify.get(
    '/:bookId/recommendations',
    {
      schema: {
        tags: ['Books'],
        description: 'Gauti panašių knygų rekomendacijas',
        params: {
          type: 'object',
          required: ['bookId'],
          properties: {
            bookId: { type: 'string', format: 'uuid' },
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
    bookController.getRecommendations.bind(bookController)
  );
}
