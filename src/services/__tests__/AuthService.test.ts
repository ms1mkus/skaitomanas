import { AuthService } from '../AuthService';
import { JwtAuthProvider } from '../../auth/JwtAuthProvider';
import { UserRepository } from '../../repositories/UserRepository';
import { ConflictError, UnauthorizedError } from '../../utils/errors';

jest.mock('../../repositories/UserRepository');
jest.mock('../../auth/JwtAuthProvider');

describe('AuthService', () => {
  let authService: AuthService;
  let authProvider: jest.Mocked<JwtAuthProvider>;
  let userRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    authProvider = new JwtAuthProvider() as jest.Mocked<JwtAuthProvider>;
    userRepository = new UserRepository() as jest.Mocked<UserRepository>;
    authService = new AuthService(authProvider, userRepository);
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        password_hash: 'hashedpassword',
        username: 'testuser',
        role: 'user' as const,
        created_at: new Date(),
        updated_at: new Date(),
      };

      userRepository.existsByEmail.mockResolvedValue(false);
      userRepository.existsByUsername.mockResolvedValue(false);
      authProvider.hashPassword.mockResolvedValue('hashedpassword');
      userRepository.create.mockResolvedValue(mockUser);
      authProvider.generateToken.mockReturnValue('token123');

      const result = await authService.register('test@example.com', 'password123', 'testuser', 'user');

      expect(result.user.email).toBe('test@example.com');
      expect(result.token).toBe('token123');
      expect(userRepository.existsByEmail).toHaveBeenCalledWith('test@example.com');
      expect(userRepository.existsByUsername).toHaveBeenCalledWith('testuser');
    });

    it('should throw error if email exists', async () => {
      userRepository.existsByEmail.mockResolvedValue(true);

      await expect(
        authService.register('test@example.com', 'password123', 'testuser', 'user')
      ).rejects.toThrow(ConflictError);
    });
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        password_hash: 'hashedpassword',
        username: 'testuser',
        role: 'user' as const,
        created_at: new Date(),
        updated_at: new Date(),
      };

      userRepository.findByEmail.mockResolvedValue(mockUser);
      authProvider.comparePassword.mockResolvedValue(true);
      authProvider.generateToken.mockReturnValue('token123');

      const result = await authService.login('test@example.com', 'password123');

      expect(result.user.email).toBe('test@example.com');
      expect(result.token).toBe('token123');
    });

    it('should throw error with invalid credentials', async () => {
      userRepository.findByEmail.mockResolvedValue(null);

      await expect(authService.login('test@example.com', 'wrongpassword')).rejects.toThrow(
        UnauthorizedError
      );
    });
  });
});


