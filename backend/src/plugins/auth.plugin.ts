import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';
import { JwtAuthProvider } from '../auth/JwtAuthProvider';
import { AuthenticatedRequest } from '../auth/guards';
import { UserRole } from '../models';

declare module 'fastify' {
  interface FastifyInstance {
    authProvider: JwtAuthProvider;
  }
}

async function authPlugin(fastify: FastifyInstance): Promise<void> {
  const authProvider = new JwtAuthProvider();
  fastify.decorate('authProvider', authProvider);

  fastify.addHook('preHandler', async (request: FastifyRequest, _reply: FastifyReply) => {
    const authHeader = request.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const payload = authProvider.verifyToken(token);
        (request as AuthenticatedRequest).user = {
          userId: payload.userId,
          email: payload.email,
          role: payload.role as UserRole,
        };
      } catch (error) {
      }
    }
  });
}

export default fp(authPlugin);

