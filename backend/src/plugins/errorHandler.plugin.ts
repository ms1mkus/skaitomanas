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
      // Handle Fastify-specific errors
      if ('code' in error && typeof error.code === 'string') {
        // Validation errors
        if (error.code === 'FST_ERR_VALIDATION') {
          logger.warn(
            { error: 'validation' in error ? error.validation : error, path: request.url },
            'Validation error'
          );
          return reply.code(422).send(errorResponse(messages.validation.invalidData));
        }

        // Bad request errors
        if (
          error.code === 'FST_ERR_CTP_EMPTY_JSON_BODY' ||
          error.code === 'FST_ERR_CTP_INVALID_JSON_BODY' ||
          error.code === 'FST_ERR_CTP_INVALID_CONTENT_LENGTH'
        ) {
          logger.warn({ error: error.message, code: error.code, path: request.url }, 'Bad request');
          return reply.code(400).send(errorResponse('Neteisingas užklausos formatas'));
        }

        // Payload too large
        if (error.code === 'FST_ERR_CTP_BODY_TOO_LARGE' || error.code === 'ECONNRESET') {
          logger.warn(
            { error: error.message, code: error.code, path: request.url },
            'Payload too large'
          );
          return reply.code(413).send(errorResponse('Užklausa per didelė'));
        }

        // Unsupported media type
        if (error.code === 'FST_ERR_CTP_INVALID_MEDIA_TYPE') {
          logger.warn(
            { error: error.message, code: error.code, path: request.url },
            'Invalid media type'
          );
          return reply.code(415).send(errorResponse('Nepalaikomas turinio tipas'));
        }

        // Method not allowed
        if (
          error.code === 'FST_ERR_NOT_FOUND' &&
          'statusCode' in error &&
          error.statusCode === 405
        ) {
          logger.warn(
            { error: error.message, code: error.code, path: request.url },
            'Method not allowed'
          );
          return reply.code(405).send(errorResponse('Metodas neleidžiamas'));
        }
      }

      // Handle Zod validation errors
      if (error instanceof ZodError) {
        logger.warn({ error: error.errors, path: request.url }, 'Validation error');
        return reply.code(422).send(errorResponse(messages.validation.invalidData));
      }

      // Handle custom AppError instances
      if (error instanceof AppError) {
        logger.warn(
          { error: error.message, statusCode: error.statusCode, path: request.url },
          'Application error'
        );
        return reply.code(error.statusCode).send(errorResponse(error.message));
      }

      // Log and return 500 for unexpected errors
      logger.error({ error, path: request.url }, 'Unexpected error');
      return reply.code(500).send(errorResponse(messages.server.error));
    }
  );

  fastify.setNotFoundHandler(async (_request: FastifyRequest, reply: FastifyReply) => {
    return reply.code(404).send(errorResponse(messages.server.notFound));
  });
}

export default fp(errorHandlerPlugin);
