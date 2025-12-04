import { BookRepository } from '../repositories/BookRepository';
import { ChapterRepository } from '../repositories/ChapterRepository';
import { NotFoundError, ForbiddenError } from '../utils/errors';
import { messages } from '../utils/messages';
import { Book, BookWithAuthor, Chapter } from '../models';

export class BookService {
  constructor(
    private bookRepository: BookRepository,
    private chapterRepository: ChapterRepository
  ) {}

  async createBook(
    title: string,
    description: string,
    authorId: string,
    coverImageUrl: string | undefined,
    language: string,
    tags: string[],
    status: string
  ): Promise<Book> {
    return await this.bookRepository.create(
      title,
      description,
      authorId,
      coverImageUrl,
      language,
      tags,
      status
    );
  }

  async getBooks(filters: {
    tag?: string;
    author?: string;
    language?: string;
    limit: number;
    offset: number;
  }): Promise<BookWithAuthor[]> {
    return await this.bookRepository.findAll(filters);
  }

  async getBookById(bookId: string): Promise<{ book: BookWithAuthor; chapters: Chapter[] }> {
    const book = await this.bookRepository.findByIdWithAuthor(bookId);
    if (!book) {
      throw new NotFoundError(messages.book.notFound);
    }

    const chapters = await this.chapterRepository.findByBookId(bookId);

    return { book, chapters };
  }

  async updateBook(
    bookId: string,
    authorId: string,
    updates: {
      title?: string;
      description?: string;
      cover_image_url?: string;
      language?: string;
      tags?: string[];
      status?: string;
    }
  ): Promise<Book> {
    const book = await this.bookRepository.findById(bookId);
    if (!book) {
      throw new NotFoundError(messages.book.notFound);
    }

    if (book.author_id !== authorId) {
      throw new ForbiddenError(messages.book.notAuthor);
    }

    const updatedBook = await this.bookRepository.update(bookId, updates);
    if (!updatedBook) {
      throw new NotFoundError(messages.book.notFound);
    }

    return updatedBook;
  }

  async deleteBook(bookId: string, authorId: string): Promise<void> {
    const book = await this.bookRepository.findById(bookId);
    if (!book) {
      throw new NotFoundError(messages.book.notFound);
    }

    if (book.author_id !== authorId) {
      throw new ForbiddenError(messages.book.notAuthor);
    }

    await this.bookRepository.delete(bookId);
  }

  async getRecommendations(bookId: string, limit: number = 5): Promise<BookWithAuthor[]> {
    const book = await this.bookRepository.findById(bookId);
    if (!book) {
      throw new NotFoundError(messages.book.notFound);
    }

    return await this.bookRepository.findSimilar(bookId, book.language, book.tags, limit);
  }
}


