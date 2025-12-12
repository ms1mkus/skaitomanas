import { FastifyReply } from 'fastify';
import { BookService } from '../services/BookService';
import { successResponse } from '../utils/response';
import { messages } from '../utils/messages';
import { AuthenticatedRequest } from '../auth/guards';
import { CreateBookInput, UpdateBookInput, BookQueryInput } from '../schemas/book.schema';

export class BookController {
  constructor(private bookService: BookService) { }

  async createBook(request: AuthenticatedRequest, reply: FastifyReply): Promise<void> {
    const { title, description, cover_image_url, language, tags, status } =
      request.body as CreateBookInput;
    const authorId = request.user!.userId;

    const book = await this.bookService.createBook(
      title,
      description || '',
      authorId,
      cover_image_url,
      language,
      tags || [],
      status || 'draft'
    );

    return reply.code(201).send(successResponse(messages.book.created, { book }));
  }

  async getBooks(request: AuthenticatedRequest, reply: FastifyReply): Promise<void> {
    const query = request.query as BookQueryInput;
    const books = await this.bookService.getBooks({
      tag: query.tag,
      author: query.author,
      language: query.language,
      limit: query.limit || 20,
      offset: query.offset || 0,
    });

    return reply.code(200).send(successResponse(messages.book.listRetrieved, { books }));
  }

  async getMyBooks(request: AuthenticatedRequest, reply: FastifyReply): Promise<void> {
    const authorId = request.user!.userId;
    const books = await this.bookService.getAuthorBooks(authorId);
    return reply.code(200).send(successResponse(messages.book.listRetrieved, { books }));
  }

  async getBookById(request: AuthenticatedRequest, reply: FastifyReply): Promise<void> {
    const { bookId } = request.params as { bookId: string };
    const result = await this.bookService.getBookById(bookId);
    return reply.code(200).send(successResponse(messages.book.detailsRetrieved, result));
  }

  async updateBook(request: AuthenticatedRequest, reply: FastifyReply): Promise<void> {
    const { bookId } = request.params as { bookId: string };
    const authorId = request.user!.userId;
    const updates = request.body as UpdateBookInput;

    const book = await this.bookService.updateBook(bookId, authorId, updates);
    return reply.code(200).send(successResponse(messages.book.updated, { book }));
  }

  async deleteBook(request: AuthenticatedRequest, reply: FastifyReply): Promise<void> {
    const { bookId } = request.params as { bookId: string };
    const authorId = request.user!.userId;

    await this.bookService.deleteBook(bookId, authorId);
    return reply.code(204).send();
  }

  async getRecommendations(request: AuthenticatedRequest, reply: FastifyReply): Promise<void> {
    const { bookId } = request.params as { bookId: string };
    const books = await this.bookService.getRecommendations(bookId);
    return reply.code(200).send(successResponse(messages.book.recommendationsRetrieved, { books }));
  }
}
