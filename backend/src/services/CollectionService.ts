import { CollectionRepository } from '../repositories/CollectionRepository';
import { BookRepository } from '../repositories/BookRepository';
import { NotFoundError, ConflictError } from '../utils/errors';
import { messages } from '../utils/messages';
import { Collection, BookWithAuthor } from '../models';

export class CollectionService {
  constructor(
    private collectionRepository: CollectionRepository,
    private bookRepository: BookRepository
  ) {}

  async addToCollection(userId: string, bookId: string): Promise<Collection> {
    const book = await this.bookRepository.findById(bookId);
    if (!book) {
      throw new NotFoundError(messages.book.notFound);
    }

    const exists = await this.collectionRepository.exists(userId, bookId);
    if (exists) {
      throw new ConflictError(messages.collection.alreadyExists);
    }

    return await this.collectionRepository.add(userId, bookId);
  }

  async removeFromCollection(userId: string, bookId: string): Promise<void> {
    const removed = await this.collectionRepository.remove(userId, bookId);
    if (!removed) {
      throw new NotFoundError(messages.collection.notFound);
    }
  }

  async getUserCollections(userId: string): Promise<BookWithAuthor[]> {
    return await this.collectionRepository.findByUserId(userId);
  }
}
