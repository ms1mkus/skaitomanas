import { FastifyInstance, FastifyError, FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';
import { ZodError } from 'zod';
import { AppError } from '../utils/errors';
import { errorResponse } from '../utils/response';
import { messages } from '../utils/messages';
import { logger } from '../utils/logger';

async function errorHandlerPlugin(fastify: FastifyInstance): Promise<void> {
  fastify.setErrorHandler(
    async (
      error: FastifyError | AppError | ZodError,
      request: FastifyRequest,
      reply: FastifyReply
    ) => {
      if ('code' in error && error.code === 'FST_ERR_VALIDATION') {
        logger.warn(
          { error: 'validation' in error ? error.validation : error, path: request.url },
          'Validation error'
        );
        return reply.code(422).send(errorResponse(messages.validation.invalidData));
      }

      if (error instanceof ZodError) {
        logger.warn({ error: error.errors, path: request.url }, 'Validation error');
        return reply.code(422).send(errorResponse(messages.validation.invalidData));
      }

      if (error instanceof AppError) {
        logger.warn(
          { error: error.message, statusCode: error.statusCode, path: request.url },
          'Application error'
        );
        return reply.code(error.statusCode).send(errorResponse(error.message));
      }

      logger.error({ error, path: request.url }, 'Unexpected error');
      return reply.code(500).send(errorResponse(messages.server.error));
    }
  );

  fastify.setNotFoundHandler(async (_request: FastifyRequest, reply: FastifyReply) => {
    return reply.code(404).send(errorResponse(messages.server.notFound));
  });
}

export default fp(errorHandlerPlugin);
