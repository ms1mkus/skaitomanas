import { AuthProvider } from '../auth/AuthProvider';
import { UserRepository } from '../repositories/UserRepository';
import { RefreshTokenRepository } from '../repositories/RefreshTokenRepository';
import { UnauthorizedError, ConflictError } from '../utils/errors';
import { messages } from '../utils/messages';
import { User } from '../models';

export class AuthService {
  constructor(
    private authProvider: AuthProvider,
    private userRepository: UserRepository,
    private refreshTokenRepository: RefreshTokenRepository
  ) {}

  async register(
    email: string,
    password: string,
    username: string,
    role: string
  ): Promise<{ user: Omit<User, 'password_hash'>; accessToken: string; refreshToken: string }> {
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

    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.authProvider.generateAccessToken(payload);
    const refreshToken = this.authProvider.generateRefreshToken(payload);

    const refreshExpiry = new Date();
    refreshExpiry.setDate(refreshExpiry.getDate() + 7);
    await this.refreshTokenRepository.create(user.id, refreshToken, refreshExpiry);

    const { password_hash, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, accessToken, refreshToken };
  }

  async login(
    email: string,
    password: string
  ): Promise<{ user: Omit<User, 'password_hash'>; accessToken: string; refreshToken: string }> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError(messages.auth.invalidCredentials);
    }

    const isValidPassword = await this.authProvider.comparePassword(password, user.password_hash);
    if (!isValidPassword) {
      throw new UnauthorizedError(messages.auth.invalidCredentials);
    }

    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.authProvider.generateAccessToken(payload);
    const refreshToken = this.authProvider.generateRefreshToken(payload);

    const refreshExpiry = new Date();
    refreshExpiry.setDate(refreshExpiry.getDate() + 7);
    await this.refreshTokenRepository.create(user.id, refreshToken, refreshExpiry);

    const { password_hash, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, accessToken, refreshToken };
  }

  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const storedToken = await this.refreshTokenRepository.findByToken(refreshToken);
    if (!storedToken) {
      throw new UnauthorizedError(messages.auth.invalidToken);
    }

    if (storedToken.expires_at < new Date()) {
      throw new UnauthorizedError(messages.auth.tokenExpired);
    }

    const payload = this.authProvider.verifyRefreshToken(refreshToken);

    const newAccessToken = this.authProvider.generateAccessToken(payload);
    const newRefreshToken = this.authProvider.generateRefreshToken(payload);

    await this.refreshTokenRepository.revokeToken(refreshToken);

    const refreshExpiry = new Date();
    refreshExpiry.setDate(refreshExpiry.getDate() + 7);
    await this.refreshTokenRepository.create(payload.userId, newRefreshToken, refreshExpiry);

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  async logout(refreshToken: string): Promise<void> {
    await this.refreshTokenRepository.revokeToken(refreshToken);
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
