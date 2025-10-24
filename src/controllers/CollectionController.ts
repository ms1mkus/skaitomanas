import { FastifyReply } from 'fastify';
import { CollectionService } from '../services/CollectionService';
import { successResponse } from '../utils/response';
import { messages } from '../utils/messages';
import { AuthenticatedRequest } from '../auth/guards';

export class CollectionController {
  constructor(private collectionService: CollectionService) {}

  async addToCollection(request: AuthenticatedRequest, reply: FastifyReply): Promise<void> {
    const { userId } = request.params as { userId: string };
    const { book_id } = request.body as { book_id: string };

    const collection = await this.collectionService.addToCollection(userId, book_id);
    reply.code(201).send(successResponse(messages.collection.added, { collection }));
  }

  async removeFromCollection(request: AuthenticatedRequest, reply: FastifyReply): Promise<void> {
    const { userId, bookId } = request.params as { userId: string; bookId: string };

    await this.collectionService.removeFromCollection(userId, bookId);
    reply.code(204).send();
  }

  async getUserCollections(request: AuthenticatedRequest, reply: FastifyReply): Promise<void> {
    const { userId } = request.params as { userId: string };
    const books = await this.collectionService.getUserCollections(userId);
    reply.code(200).send(successResponse(messages.collection.listRetrieved, { books }));
  }
}


