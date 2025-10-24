import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AuthProvider, TokenPayload } from './AuthProvider';
import { UnauthorizedError } from '../utils/errors';
import { messages } from '../utils/messages';

export class JwtAuthProvider implements AuthProvider {
  private readonly secret: string;
  private readonly expiresIn: string;

  constructor(secret?: string, expiresIn?: string) {
    this.secret = secret || process.env.JWT_SECRET || 'default-secret-change-in-production';
    this.expiresIn = expiresIn || process.env.JWT_EXPIRES_IN || '7d';
  }

  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  generateToken(payload: TokenPayload): string {
    return jwt.sign(payload, this.secret, { expiresIn: this.expiresIn } as jwt.SignOptions);
  }

  verifyToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, this.secret) as TokenPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedError(messages.auth.tokenExpired);
      }
      throw new UnauthorizedError(messages.auth.invalidToken);
    }
  }
}

