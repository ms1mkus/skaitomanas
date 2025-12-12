import { BookRepository } from '../repositories/BookRepository';
import { ChapterRepository } from '../repositories/ChapterRepository';
import { CommentRepository } from '../repositories/CommentRepository';
import { ReadingHistoryRepository } from '../repositories/ReadingHistoryRepository';
import { UserRepository } from '../repositories/UserRepository';
import { NotFoundError } from '../utils/errors';
import { messages } from '../utils/messages';
import { AuthorStats } from '../models';

export class StatsService {
  constructor(
    private bookRepository: BookRepository,
    private chapterRepository: ChapterRepository,
    private commentRepository: CommentRepository,
    private readingHistoryRepository: ReadingHistoryRepository,
    private userRepository: UserRepository
  ) { }

  async getAuthorStats(authorId: string): Promise<AuthorStats> {
    const author = await this.userRepository.findById(authorId);
    if (!author) {
      throw new NotFoundError(messages.user.notFound);
    }

    const books = await this.bookRepository.findByAuthorId(authorId);
    const totalBooks = books.length;

    let totalChapters = 0;
    for (const book of books) {
      const count = await this.chapterRepository.countByBookId(book.id);
      totalChapters += count;
    }

    const totalReaders = await this.readingHistoryRepository.countUniqueReadersByAuthorId(authorId);
    const totalComments = await this.commentRepository.countByAuthorId(authorId);
    const mostReadBook = await this.readingHistoryRepository.getMostReadBookByAuthorId(authorId);

    return {
      total_books: totalBooks,
      total_chapters: totalChapters,
      total_readers: totalReaders,
      total_comments: totalComments,
      most_read_book: mostReadBook || undefined,
    };
  }

  async getUserReadingHistory(userId: string): Promise<any[]> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError(messages.user.notFound);
    }

    return await this.readingHistoryRepository.findByUserIdWithProgress(userId);
  }
}
