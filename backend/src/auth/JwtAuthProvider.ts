import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AuthProvider, TokenPayload } from './AuthProvider';
import { UnauthorizedError } from '../utils/errors';
import { messages } from '../utils/messages';

export class JwtAuthProvider implements AuthProvider {
  private readonly accessTokenSecret: string;
  private readonly refreshTokenSecret: string;
  private readonly accessTokenExpiry: string;
  private readonly refreshTokenExpiry: string;

  constructor() {
    this.accessTokenSecret = process.env.JWT_SECRET || 'default-access-secret-change-in-production';
    this.refreshTokenSecret = process.env.JWT_REFRESH_SECRET || 'default-refresh-secret-change-in-production';
    this.accessTokenExpiry = process.env.JWT_EXPIRES_IN || '15m';
    this.refreshTokenExpiry = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
  }

  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, this.accessTokenSecret, { expiresIn: this.accessTokenExpiry } as jwt.SignOptions);
  }

  generateRefreshToken(payload: TokenPayload): string {
    return jwt.sign(payload, this.refreshTokenSecret, { expiresIn: this.refreshTokenExpiry } as jwt.SignOptions);
  }

  verifyAccessToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, this.accessTokenSecret) as TokenPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedError(messages.auth.tokenExpired);
      }
      throw new UnauthorizedError(messages.auth.invalidToken);
    }
  }

  verifyRefreshToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, this.refreshTokenSecret) as TokenPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedError(messages.auth.tokenExpired);
      }
      throw new UnauthorizedError(messages.auth.invalidToken);
    }
  }
}
