import { AuthController } from '../AuthController';
import { AuthService } from '../../services/AuthService';
import { FastifyReply } from 'fastify';
import { AuthenticatedRequest } from '../../auth/guards';

jest.mock('../../services/AuthService');

describe('AuthController', () => {
  let authController: AuthController;
  let authService: jest.Mocked<AuthService>;
  let mockReply: jest.Mocked<FastifyReply>;

  beforeEach(() => {
    authService = new AuthService(null as any, null as any) as jest.Mocked<AuthService>;
    authController = new AuthController(authService);

    mockReply = {
      code: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    } as unknown as jest.Mocked<FastifyReply>;
  });

  describe('register', () => {
    it('should register user and return 201', async () => {
      const mockRequest = {
        body: {
          email: 'test@example.com',
          password: 'password123',
          username: 'testuser',
          role: 'user',
        },
      } as AuthenticatedRequest;

      const mockResult = {
        user: {
          id: '123',
          email: 'test@example.com',
          username: 'testuser',
          role: 'user',
        },
        token: 'token123',
      };

      authService.register = jest.fn().mockResolvedValue(mockResult);

      await authController.register(mockRequest, mockReply);

      expect(mockReply.code).toHaveBeenCalledWith(201);
      expect(mockReply.send).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should login user and return 200', async () => {
      const mockRequest = {
        body: {
          email: 'test@example.com',
          password: 'password123',
        },
      } as AuthenticatedRequest;

      const mockResult = {
        user: {
          id: '123',
          email: 'test@example.com',
          username: 'testuser',
          role: 'user',
        },
        token: 'token123',
      };

      authService.login = jest.fn().mockResolvedValue(mockResult);

      await authController.login(mockRequest, mockReply);

      expect(mockReply.code).toHaveBeenCalledWith(200);
      expect(mockReply.send).toHaveBeenCalled();
    });
  });
});


