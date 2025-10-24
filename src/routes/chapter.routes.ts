import { FastifyInstance } from 'fastify';
import { ChapterController } from '../controllers/ChapterController';
import { requireAuth, requireRole } from '../auth/guards';
import { UserRole } from '../models';
import { createChapterSchema, updateChapterSchema } from '../schemas/chapter.schema';

export async function chapterRoutes(
  fastify: FastifyInstance,
  chapterController: ChapterController
): Promise<void> {
  fastify.get(
    '/:bookId/chapters',
    {
      schema: {
        tags: ['Chapters'],
        description: 'Gauti knygos skyrių sąrašą',
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
    chapterController.getChaptersByBookId.bind(chapterController)
  );

  fastify.get(
    '/:bookId/chapters/:chapterId',
    {
      schema: {
        tags: ['Chapters'],
        description: 'Perskaityti skyrių (užregistruoja skaitymo istoriją)',
        params: {
          type: 'object',
          required: ['bookId', 'chapterId'],
          properties: {
            bookId: { type: 'string', format: 'uuid' },
            chapterId: { type: 'string', format: 'uuid' },
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
    chapterController.getChapterById.bind(chapterController)
  );

  fastify.post('/:bookId/chapters', {
    schema: {
      tags: ['Chapters'],
      description: 'Sukurti naują skyrių (tik autorius)',
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
        required: ['title', 'content', 'chapter_number'],
        properties: {
          title: { type: 'string', minLength: 1, maxLength: 500 },
          content: { type: 'string', minLength: 1 },
          chapter_number: { type: 'number', minimum: 1 },
          is_published: { type: 'boolean' },
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
      createChapterSchema.parse(request.body);
      await chapterController.createChapter(request, reply);
    },
  });

  fastify.patch('/:bookId/chapters/:chapterId', {
    schema: {
      tags: ['Chapters'],
      description: 'Atnaujinti skyrių (tik autorius)',
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        required: ['bookId', 'chapterId'],
        properties: {
          bookId: { type: 'string', format: 'uuid' },
          chapterId: { type: 'string', format: 'uuid' },
        },
      },
      body: {
        type: 'object',
        properties: {
          title: { type: 'string', minLength: 1, maxLength: 500 },
          content: { type: 'string', minLength: 1 },
          chapter_number: { type: 'number', minimum: 1 },
          is_published: { type: 'boolean' },
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
      updateChapterSchema.parse(request.body);
      await chapterController.updateChapter(request, reply);
    },
  });

  fastify.delete(
    '/:bookId/chapters/:chapterId',
    {
      schema: {
        tags: ['Chapters'],
        description: 'Ištrinti skyrių (tik autorius)',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['bookId', 'chapterId'],
          properties: {
            bookId: { type: 'string', format: 'uuid' },
            chapterId: { type: 'string', format: 'uuid' },
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
    chapterController.deleteChapter.bind(chapterController)
  );
}
