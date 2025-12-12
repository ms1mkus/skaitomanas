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
      if ('code' in error && typeof error.code === 'string') {
        if (error.code === 'FST_ERR_VALIDATION') {
          logger.warn(
            { error: 'validation' in error ? error.validation : error, path: request.url },
            'Validation error'
          );
          return reply.code(422).send(errorResponse(messages.validation.invalidData));
        }

        if (
          error.code === 'FST_ERR_CTP_EMPTY_JSON_BODY' ||
          error.code === 'FST_ERR_CTP_INVALID_JSON_BODY' ||
          error.code === 'FST_ERR_CTP_INVALID_CONTENT_LENGTH'
        ) {
          logger.warn({ error: error.message, code: error.code, path: request.url }, 'Bad request');
          return reply.code(400).send(errorResponse('Neteisingas užklausos formatas'));
        }

        if (error.code === 'FST_ERR_CTP_BODY_TOO_LARGE' || error.code === 'ECONNRESET') {
          logger.warn(
            { error: error.message, code: error.code, path: request.url },
            'Payload too large'
          );
          return reply.code(413).send(errorResponse('Užklausa per didelė'));
        }

        if (error.code === 'FST_ERR_CTP_INVALID_MEDIA_TYPE') {
          logger.warn(
            { error: error.message, code: error.code, path: request.url },
            'Invalid media type'
          );
          return reply.code(415).send(errorResponse('Nepalaikomas turinio tipas'));
        }

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

      if (error instanceof ZodError) {
        const firstError = error.errors[0];
        const message = firstError ? firstError.message : messages.validation.invalidData;
        logger.warn({ error: error.errors, path: request.url }, 'Validation error');
        return reply.code(422).send(errorResponse(message));
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
}

export default fp(errorHandlerPlugin);
