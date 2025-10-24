import { FastifyReply } from 'fastify';
import { CommentService } from '../services/CommentService';
import { successResponse } from '../utils/response';
import { messages } from '../utils/messages';
import { AuthenticatedRequest } from '../auth/guards';
import { CreateCommentInput, UpdateCommentInput } from '../schemas/comment.schema';

export class CommentController {
  constructor(private commentService: CommentService) {}

  async createComment(request: AuthenticatedRequest, reply: FastifyReply): Promise<void> {
    const { chapterId } = request.params as { chapterId: string };
    const { content } = request.body as CreateCommentInput;
    const userId = request.user!.userId;

    const comment = await this.commentService.createComment(chapterId, userId, content);
    reply.code(201).send(successResponse(messages.comment.created, { comment }));
  }

  async getCommentsByChapterId(request: AuthenticatedRequest, reply: FastifyReply): Promise<void> {
    const { chapterId } = request.params as { chapterId: string };
    const comments = await this.commentService.getCommentsByChapterId(chapterId);
    reply.code(200).send(successResponse(messages.comment.listRetrieved, { comments }));
  }

  async updateComment(request: AuthenticatedRequest, reply: FastifyReply): Promise<void> {
    const { commentId } = request.params as { commentId: string };
    const { content } = request.body as UpdateCommentInput;
    const userId = request.user!.userId;

    const comment = await this.commentService.updateComment(commentId, userId, content);
    reply.code(200).send(successResponse(messages.comment.updated, { comment }));
  }

  async deleteComment(request: AuthenticatedRequest, reply: FastifyReply): Promise<void> {
    const { commentId } = request.params as { commentId: string };
    const userId = request.user!.userId;
    const userRole = request.user!.role;

    await this.commentService.deleteComment(commentId, userId, userRole);
    reply.code(204).send();
  }
}


