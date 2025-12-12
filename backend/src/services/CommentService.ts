import { CommentRepository } from '../repositories/CommentRepository';
import { ChapterRepository } from '../repositories/ChapterRepository';
import { NotFoundError, ForbiddenError } from '../utils/errors';
import { messages } from '../utils/messages';
import { Comment, CommentWithUser, UserRole } from '../models';

export class CommentService {
  constructor(
    private commentRepository: CommentRepository,
    private chapterRepository: ChapterRepository
  ) { }

  async getCommentById(commentId: string): Promise<CommentWithUser> {
    const comment = await this.commentRepository.findByIdWithUser(commentId);
    if (!comment) {
      throw new NotFoundError(messages.comment.notFound);
    }
    return comment;
  }

  async createComment(chapterId: string, userId: string, content: string): Promise<Comment> {
    const chapter = await this.chapterRepository.findById(chapterId);
    if (!chapter) {
      throw new NotFoundError(messages.chapter.notFound);
    }

    return await this.commentRepository.create(chapterId, userId, content);
  }

  async getCommentsByChapterId(chapterId: string): Promise<CommentWithUser[]> {
    const chapter = await this.chapterRepository.findById(chapterId);
    if (!chapter) {
      throw new NotFoundError(messages.chapter.notFound);
    }

    return await this.commentRepository.findByChapterId(chapterId);
  }

  async updateComment(commentId: string, userId: string, content: string): Promise<Comment> {
    const comment = await this.commentRepository.findById(commentId);
    if (!comment) {
      throw new NotFoundError(messages.comment.notFound);
    }

    if (comment.user_id !== userId) {
      throw new ForbiddenError(messages.comment.notOwner);
    }

    const updatedComment = await this.commentRepository.update(commentId, content);
    if (!updatedComment) {
      throw new NotFoundError(messages.comment.notFound);
    }

    return updatedComment;
  }

  async deleteComment(commentId: string, userId: string, userRole: UserRole): Promise<void> {
    const comment = await this.commentRepository.findById(commentId);
    if (!comment) {
      throw new NotFoundError(messages.comment.notFound);
    }

    if (comment.user_id !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenError(messages.comment.notOwner);
    }

    await this.commentRepository.delete(commentId);
  }
}
