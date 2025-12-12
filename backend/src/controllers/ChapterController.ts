import { FastifyReply } from 'fastify';
import { ChapterService } from '../services/ChapterService';
import { successResponse } from '../utils/response';
import { messages } from '../utils/messages';
import { AuthenticatedRequest } from '../auth/guards';
import { CreateChapterInput, UpdateChapterInput } from '../schemas/chapter.schema';

export class ChapterController {
  constructor(private chapterService: ChapterService) { }

  async createChapter(request: AuthenticatedRequest, reply: FastifyReply): Promise<void> {
    const { bookId } = request.params as { bookId: string };
    const { title, content, chapter_number, is_published } = request.body as CreateChapterInput;
    const authorId = request.user!.userId;

    const chapter = await this.chapterService.createChapter(
      bookId,
      authorId,
      title,
      content,
      chapter_number,
      is_published || false
    );

    return reply.code(201).send(successResponse(messages.chapter.created, { chapter }));
  }

  async getChaptersByBookId(request: AuthenticatedRequest, reply: FastifyReply): Promise<void> {
    const { bookId } = request.params as { bookId: string };
    const chapters = await this.chapterService.getChaptersByBookId(bookId);
    return reply.code(200).send(successResponse(messages.chapter.listRetrieved, { chapters }));
  }

  async getChapterById(request: AuthenticatedRequest, reply: FastifyReply): Promise<void> {
    const { bookId, chapterId } = request.params as { bookId: string; chapterId: string };
    const userId = request.user?.userId;

    const chapter = await this.chapterService.getChapterById(bookId, chapterId, userId);
    return reply.code(200).send(successResponse(messages.chapter.retrieved, { chapter }));
  }

  async updateChapter(request: AuthenticatedRequest, reply: FastifyReply): Promise<void> {
    const { bookId, chapterId } = request.params as { bookId: string; chapterId: string };
    const authorId = request.user!.userId;
    const updates = request.body as UpdateChapterInput;

    const chapter = await this.chapterService.updateChapter(bookId, chapterId, authorId, updates);
    return reply.code(200).send(successResponse(messages.chapter.updated, { chapter }));
  }

  async deleteChapter(request: AuthenticatedRequest, reply: FastifyReply): Promise<void> {
    const { bookId, chapterId } = request.params as { bookId: string; chapterId: string };
    const authorId = request.user!.userId;

    await this.chapterService.deleteChapter(bookId, chapterId, authorId);
    return reply.code(204).send();
  }
}
