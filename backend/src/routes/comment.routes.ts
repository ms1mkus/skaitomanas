import { FastifyInstance, FastifyReply } from 'fastify';
import { CommentController } from '../controllers/CommentController';
import { requireAuth, requireRole, AuthenticatedRequest } from '../auth/guards';
import { UserRole } from '../models';
import { createCommentSchema, updateCommentSchema } from '../schemas/comment.schema';

export async function commentRoutes(
  fastify: FastifyInstance,
  commentController: CommentController
): Promise<void> {
  fastify.get(
    '/chapters/:chapterId/comments',
    {
      schema: {
        tags: ['Comments'],
        description: 'Gauti skyriaus komentarų sąrašą',
        params: {
          type: 'object',
          required: ['chapterId'],
          properties: {
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
    commentController.getCommentsByChapterId.bind(commentController)
  );

  fastify.post('/chapters/:chapterId/comments', {
    schema: {
      tags: ['Comments'],
      description: 'Pridėti komentarą (tik registruotiems vartotojams)',
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        required: ['chapterId'],
        properties: {
          chapterId: { type: 'string', format: 'uuid' },
        },
      },
      body: {
        type: 'object',
        required: ['content'],
        properties: {
          content: { type: 'string', minLength: 1, maxLength: 2000 },
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
    preHandler: [requireAuth, requireRole([UserRole.USER, UserRole.AUTHOR, UserRole.ADMIN])],
    handler: async (request: AuthenticatedRequest, reply: FastifyReply) => {
      createCommentSchema.parse(request.body);
      await commentController.createComment(request, reply);
    },
  });

  fastify.patch('/comments/:commentId', {
    schema: {
      tags: ['Comments'],
      description: 'Redaguoti komentarą (tik savininkas)',
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        required: ['commentId'],
        properties: {
          commentId: { type: 'string', format: 'uuid' },
        },
      },
      body: {
        type: 'object',
        required: ['content'],
        properties: {
          content: { type: 'string', minLength: 1, maxLength: 2000 },
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
    handler: async (request: AuthenticatedRequest, reply: FastifyReply) => {
      updateCommentSchema.parse(request.body);
      await commentController.updateComment(request, reply);
    },
  });

  fastify.delete(
    '/comments/:commentId',
    {
      schema: {
        tags: ['Comments'],
        description: 'Ištrinti komentarą (savininkas arba admin)',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['commentId'],
          properties: {
            commentId: { type: 'string', format: 'uuid' },
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
    commentController.deleteComment.bind(commentController)
  );
}
