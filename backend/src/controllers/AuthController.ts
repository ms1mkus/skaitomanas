import { FastifyReply } from 'fastify';
import { AuthService } from '../services/AuthService';
import { successResponse } from '../utils/response';
import { messages } from '../utils/messages';
import { AuthenticatedRequest } from '../auth/guards';
import { RegisterInput, LoginInput } from '../schemas/auth.schema';

export class AuthController {
  constructor(private authService: AuthService) {}

  async register(request: AuthenticatedRequest, reply: FastifyReply): Promise<void> {
    const { email, password, username, role } = request.body as RegisterInput;
    const result = await this.authService.register(email, password, username, role || 'user');
    return reply.code(201).send(successResponse(messages.auth.registerSuccess, result));
  }

  async login(request: AuthenticatedRequest, reply: FastifyReply): Promise<void> {
    const { email, password } = request.body as LoginInput;
    const result = await this.authService.login(email, password);
    return reply.code(200).send(successResponse(messages.auth.loginSuccess, result));
  }

  async refresh(request: AuthenticatedRequest, reply: FastifyReply): Promise<void> {
    const { refreshToken } = request.body as { refreshToken: string };
    const result = await this.authService.refreshAccessToken(refreshToken);
    return reply.code(200).send(successResponse(messages.auth.tokenRefreshed, result));
  }

  async logout(request: AuthenticatedRequest, reply: FastifyReply): Promise<void> {
    const { refreshToken } = request.body as { refreshToken: string };
    await this.authService.logout(refreshToken);
    return reply.code(200).send(successResponse(messages.auth.logoutSuccess, null));
  }

  async me(request: AuthenticatedRequest, reply: FastifyReply): Promise<void> {
    const userId = request.user!.userId;
    const user = await this.authService.getCurrentUser(userId);
    return reply.code(200).send(successResponse(messages.user.profileRetrieved, { user }));
  }
}
