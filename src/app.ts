import Fastify from 'fastify';
import type { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import * as dotenv from 'dotenv';
import { logger } from './utils/logger';
import authPlugin from './plugins/auth.plugin';
import swaggerPlugin from './plugins/swagger.plugin';
import errorHandlerPlugin from './plugins/errorHandler.plugin';
import { JwtAuthProvider } from './auth/JwtAuthProvider';
import { UserRepository } from './repositories/UserRepository';
import { BookRepository } from './repositories/BookRepository';
import { ChapterRepository } from './repositories/ChapterRepository';
import { CommentRepository } from './repositories/CommentRepository';
import { CollectionRepository } from './repositories/CollectionRepository';
import { ReadingHistoryRepository } from './repositories/ReadingHistoryRepository';
import { AuthService } from './services/AuthService';
import { BookService } from './services/BookService';
import { ChapterService } from './services/ChapterService';
import { CommentService } from './services/CommentService';
import { CollectionService } from './services/CollectionService';
import { StatsService } from './services/StatsService';
import { AuthController } from './controllers/AuthController';
import { BookController } from './controllers/BookController';
import { ChapterController } from './controllers/ChapterController';
import { CommentController } from './controllers/CommentController';
import { CollectionController } from './controllers/CollectionController';
import { StatsController } from './controllers/StatsController';
import { authRoutes } from './routes/auth.routes';
import { bookRoutes } from './routes/book.routes';
import { chapterRoutes } from './routes/chapter.routes';
import { commentRoutes } from './routes/comment.routes';
import { collectionRoutes } from './routes/collection.routes';
import { statsRoutes } from './routes/stats.routes';

dotenv.config();

export async function createApp() {
  const app = Fastify({
    logger: logger,
    ajv: {
      customOptions: {
        removeAdditional: 'all',
        coerceTypes: true,
        useDefaults: true,
      },
    },
  });

  await app.register(cors, {
    origin: true,
    credentials: true,
  });

  await app.register(authPlugin);
  await app.register(errorHandlerPlugin);
  await app.register(swaggerPlugin);

  const authProvider = new JwtAuthProvider();
  const userRepository = new UserRepository();
  const bookRepository = new BookRepository();
  const chapterRepository = new ChapterRepository();
  const commentRepository = new CommentRepository();
  const collectionRepository = new CollectionRepository();
  const readingHistoryRepository = new ReadingHistoryRepository();

  const authService = new AuthService(authProvider, userRepository);
  const bookService = new BookService(bookRepository, chapterRepository);
  const chapterService = new ChapterService(
    chapterRepository,
    bookRepository,
    readingHistoryRepository
  );
  const commentService = new CommentService(commentRepository, chapterRepository);
  const collectionService = new CollectionService(collectionRepository, bookRepository);
  const statsService = new StatsService(
    bookRepository,
    chapterRepository,
    commentRepository,
    readingHistoryRepository,
    userRepository
  );

  const authController = new AuthController(authService);
  const bookController = new BookController(bookService);
  const chapterController = new ChapterController(chapterService);
  const commentController = new CommentController(commentService);
  const collectionController = new CollectionController(collectionService);
  const statsController = new StatsController(statsService);

  await app.register(
    async (instance: FastifyInstance) => {
      await authRoutes(instance, authController);
    },
    { prefix: '/auth' }
  );

  await app.register(
    async (instance: FastifyInstance) => {
      await bookRoutes(instance, bookController);
      await chapterRoutes(instance, chapterController);
    },
    { prefix: '/books' }
  );

  await app.register(
    async (instance: FastifyInstance) => {
      await commentRoutes(instance, commentController);
    },
    { prefix: '' }
  );

  await app.register(
    async (instance: FastifyInstance) => {
      await collectionRoutes(instance, collectionController);
      await statsRoutes(instance, statsController);
    },
    { prefix: '/users' }
  );

  await app.register(
    async (instance: FastifyInstance) => {
      await statsRoutes(instance, statsController);
    },
    { prefix: '' }
  );

  return app;
}
