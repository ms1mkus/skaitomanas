import { AuthProvider } from '../auth/AuthProvider';
import { UserRepository } from '../repositories/UserRepository';
import { UnauthorizedError, ConflictError } from '../utils/errors';
import { messages } from '../utils/messages';
import { User } from '../models';

export class AuthService {
  constructor(
    private authProvider: AuthProvider,
    private userRepository: UserRepository
  ) {}

  async register(
    email: string,
    password: string,
    username: string,
    role: string
  ): Promise<{ user: Omit<User, 'password_hash'>; token: string }> {
    const emailExists = await this.userRepository.existsByEmail(email);
    if (emailExists) {
      throw new ConflictError(messages.auth.emailExists);
    }

    const usernameExists = await this.userRepository.existsByUsername(username);
    if (usernameExists) {
      throw new ConflictError(messages.auth.usernameExists);
    }

    const passwordHash = await this.authProvider.hashPassword(password);
    const user = await this.userRepository.create(email, passwordHash, username, role);

    const token = this.authProvider.generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const { password_hash, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, token };
  }

  async login(email: string, password: string): Promise<{ user: Omit<User, 'password_hash'>; token: string }> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError(messages.auth.invalidCredentials);
    }

    const isValidPassword = await this.authProvider.comparePassword(password, user.password_hash);
    if (!isValidPassword) {
      throw new UnauthorizedError(messages.auth.invalidCredentials);
    }

    const token = this.authProvider.generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const { password_hash, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, token };
  }

  async getCurrentUser(userId: string): Promise<Omit<User, 'password_hash'>> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedError(messages.user.notFound);
    }

    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}


