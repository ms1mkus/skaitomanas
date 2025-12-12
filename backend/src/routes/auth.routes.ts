import { FastifyInstance } from 'fastify';
import { AuthController } from '../controllers/AuthController';
import { requireAuth } from '../auth/guards';
import { registerSchema, loginSchema } from '../schemas/auth.schema';

export async function authRoutes(
  fastify: FastifyInstance,
  authController: AuthController
): Promise<void> {
  fastify.post(
    '/register',
    {
      schema: {
        tags: ['Auth'],
        description: 'Registruoti naują vartotoją',
        body: {
          type: 'object',
          required: ['email', 'password', 'username'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 8 },
            username: { type: 'string', minLength: 3, maxLength: 100 },
            role: { type: 'string', enum: ['user', 'author'] },
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
      preHandler: async (request, _reply) => {
        registerSchema.parse(request.body);
      },
    },
    authController.register.bind(authController)
  );

  fastify.post(
    '/login',
    {
      schema: {
        tags: ['Auth'],
        description: 'Prisijungti prie sistemos',
        body: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string' },
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
        loginSchema.parse(request.body);
      },
    },
    authController.login.bind(authController)
  );

  fastify.post(
    '/refresh',
    {
      schema: {
        tags: ['Auth'],
        description: 'Atnaujinti prieigos tokeną',
        body: {
          type: 'object',
          required: ['refreshToken'],
          properties: {
            refreshToken: { type: 'string' },
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
    authController.refresh.bind(authController)
  );

  fastify.post(
    '/logout',
    {
      schema: {
        tags: ['Auth'],
        description: 'Atsijungti iš sistemos',
        body: {
          type: 'object',
          required: ['refreshToken'],
          properties: {
            refreshToken: { type: 'string' },
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
    authController.logout.bind(authController)
  );

  fastify.get(
    '/me',
    {
      schema: {
        tags: ['Auth'],
        description: 'Gauti dabartinio vartotojo informaciją',
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
      preHandler: requireAuth,
    },
    authController.me.bind(authController)
  );
}
