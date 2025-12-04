import { FastifyRequest, FastifyReply } from 'fastify';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';
import { messages } from '../utils/messages';
import { UserRole } from '../models';

export interface AuthenticatedRequest extends FastifyRequest {
  user?: {
    userId: string;
    email: string;
    role: UserRole;
  };
}

export const requireAuth = async (
  request: AuthenticatedRequest,
  _reply: FastifyReply
): Promise<void> => {
  if (!request.user) {
    throw new UnauthorizedError(messages.auth.unauthorized);
  }
};

export const requireRole = (roles: UserRole[]) => {
  return async (request: AuthenticatedRequest, _reply: FastifyReply): Promise<void> => {
    if (!request.user) {
      throw new UnauthorizedError(messages.auth.unauthorized);
    }

    if (!roles.includes(request.user.role)) {
      throw new ForbiddenError(messages.auth.forbidden);
    }
  };
};

