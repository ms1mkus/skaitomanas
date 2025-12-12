import { FastifyReply } from 'fastify';
import { StatsService } from '../services/StatsService';
import { successResponse } from '../utils/response';
import { messages } from '../utils/messages';
import { AuthenticatedRequest } from '../auth/guards';

export class StatsController {
  constructor(private statsService: StatsService) { }

  async getAuthorStats(request: AuthenticatedRequest, reply: FastifyReply): Promise<void> {
    const { authorId } = request.params as { authorId: string };
    const stats = await this.statsService.getAuthorStats(authorId);
    return reply.code(200).send(successResponse(messages.stats.retrieved, { stats }));
  }

  async getUserReadingHistory(request: AuthenticatedRequest, reply: FastifyReply): Promise<void> {
    const { userId } = request.params as { userId: string };
    const history = await this.statsService.getUserReadingHistory(userId);
    return reply.code(200).send(successResponse(messages.history.retrieved, { history }));
  }
}
