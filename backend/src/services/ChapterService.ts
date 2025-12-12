import { ChapterRepository } from '../repositories/ChapterRepository';
import { BookRepository } from '../repositories/BookRepository';
import { ReadingHistoryRepository } from '../repositories/ReadingHistoryRepository';
import { NotFoundError, ForbiddenError } from '../utils/errors';
import { messages } from '../utils/messages';
import { Chapter } from '../models';

export class ChapterService {
  constructor(
    private chapterRepository: ChapterRepository,
    private bookRepository: BookRepository,
    private readingHistoryRepository: ReadingHistoryRepository
  ) { }

  async createChapter(
    bookId: string,
    authorId: string,
    title: string,
    content: string,
    chapterNumber: number,
    isPublished: boolean
  ): Promise<Chapter> {
    const book = await this.bookRepository.findById(bookId);
    if (!book) {
      throw new NotFoundError(messages.book.notFound);
    }

    if (book.author_id !== authorId) {
      throw new ForbiddenError(messages.chapter.notAuthor);
    }

    return await this.chapterRepository.create(bookId, title, content, chapterNumber, isPublished);
  }

  async getChaptersByBookId(bookId: string): Promise<Chapter[]> {
    const book = await this.bookRepository.findById(bookId);
    if (!book) {
      throw new NotFoundError(messages.book.notFound);
    }

    return await this.chapterRepository.findByBookId(bookId);
  }

  async getChapterById(bookId: string, chapterId: string, userId?: string): Promise<Chapter> {
    const chapter = await this.chapterRepository.findById(chapterId);
    if (!chapter || chapter.book_id !== bookId) {
      throw new NotFoundError(messages.chapter.notFound);
    }

    if (userId) {
      await this.readingHistoryRepository.upsert(userId, chapterId, bookId, chapter.word_count || 0);
    }

    return chapter;
  }

  async updateChapter(
    bookId: string,
    chapterId: string,
    authorId: string,
    updates: {
      title?: string;
      content?: string;
      chapter_number?: number;
      is_published?: boolean;
    }
  ): Promise<Chapter> {
    const book = await this.bookRepository.findById(bookId);
    if (!book) {
      throw new NotFoundError(messages.book.notFound);
    }

    if (book.author_id !== authorId) {
      throw new ForbiddenError(messages.chapter.notAuthor);
    }

    const chapter = await this.chapterRepository.findById(chapterId);
    if (!chapter || chapter.book_id !== bookId) {
      throw new NotFoundError(messages.chapter.notFound);
    }

    const updatedChapter = await this.chapterRepository.update(chapterId, updates);
    if (!updatedChapter) {
      throw new NotFoundError(messages.chapter.notFound);
    }

    return updatedChapter;
  }

  async deleteChapter(bookId: string, chapterId: string, authorId: string): Promise<void> {
    const book = await this.bookRepository.findById(bookId);
    if (!book) {
      throw new NotFoundError(messages.book.notFound);
    }

    if (book.author_id !== authorId) {
      throw new ForbiddenError(messages.chapter.notAuthor);
    }

    const chapter = await this.chapterRepository.findById(chapterId);
    if (!chapter || chapter.book_id !== bookId) {
      throw new NotFoundError(messages.chapter.notFound);
    }

    await this.chapterRepository.delete(chapterId);
  }
}
