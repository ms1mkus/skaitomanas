import { BookService } from '../BookService';
import { BookRepository } from '../../repositories/BookRepository';
import { ChapterRepository } from '../../repositories/ChapterRepository';
import { NotFoundError, ForbiddenError } from '../../utils/errors';

jest.mock('../../repositories/BookRepository');
jest.mock('../../repositories/ChapterRepository');

describe('BookService', () => {
  let bookService: BookService;
  let bookRepository: jest.Mocked<BookRepository>;
  let chapterRepository: jest.Mocked<ChapterRepository>;

  beforeEach(() => {
    bookRepository = new BookRepository() as jest.Mocked<BookRepository>;
    chapterRepository = new ChapterRepository() as jest.Mocked<ChapterRepository>;
    bookService = new BookService(bookRepository, chapterRepository);
  });

  describe('createBook', () => {
    it('should create a book successfully', async () => {
      const mockBook = {
        id: '123',
        title: 'Test Book',
        description: 'Test Description',
        author_id: 'author123',
        language: 'lt',
        tags: ['test'],
        status: 'draft' as const,
        created_at: new Date(),
        updated_at: new Date(),
      };

      bookRepository.create.mockResolvedValue(mockBook);

      const result = await bookService.createBook(
        'Test Book',
        'Test Description',
        'author123',
        undefined,
        'lt',
        ['test'],
        'draft'
      );

      expect(result.title).toBe('Test Book');
      expect(bookRepository.create).toHaveBeenCalled();
    });
  });

  describe('getBookById', () => {
    it('should return book with chapters', async () => {
      const mockBook = {
        id: '123',
        title: 'Test Book',
        description: 'Test Description',
        author_id: 'author123',
        author_username: 'testauthor',
        author_email: 'author@test.com',
        language: 'lt',
        tags: ['test'],
        status: 'published' as const,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const mockChapters = [
        {
          id: 'chapter1',
          book_id: '123',
          title: 'Chapter 1',
          content: 'Content',
          chapter_number: 1,
          is_published: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      bookRepository.findByIdWithAuthor.mockResolvedValue(mockBook);
      chapterRepository.findByBookId.mockResolvedValue(mockChapters);

      const result = await bookService.getBookById('123');

      expect(result.book.title).toBe('Test Book');
      expect(result.chapters).toHaveLength(1);
    });

    it('should throw NotFoundError if book does not exist', async () => {
      bookRepository.findByIdWithAuthor.mockResolvedValue(null);

      await expect(bookService.getBookById('nonexistent')).rejects.toThrow(NotFoundError);
    });
  });

  describe('updateBook', () => {
    it('should update book successfully', async () => {
      const mockBook = {
        id: '123',
        title: 'Test Book',
        description: 'Test Description',
        author_id: 'author123',
        language: 'lt',
        tags: ['test'],
        status: 'draft' as const,
        created_at: new Date(),
        updated_at: new Date(),
      };

      bookRepository.findById.mockResolvedValue(mockBook);
      bookRepository.update.mockResolvedValue({ ...mockBook, title: 'Updated Title' });

      const result = await bookService.updateBook('123', 'author123', { title: 'Updated Title' });

      expect(result.title).toBe('Updated Title');
    });

    it('should throw ForbiddenError if user is not the author', async () => {
      const mockBook = {
        id: '123',
        title: 'Test Book',
        description: 'Test Description',
        author_id: 'author123',
        language: 'lt',
        tags: ['test'],
        status: 'draft' as const,
        created_at: new Date(),
        updated_at: new Date(),
      };

      bookRepository.findById.mockResolvedValue(mockBook);

      await expect(
        bookService.updateBook('123', 'differentauthor', { title: 'Updated' })
      ).rejects.toThrow(ForbiddenError);
    });
  });
});


