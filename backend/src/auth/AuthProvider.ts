export interface AuthProvider {
  hashPassword(password: string): Promise<string>;
  comparePassword(password: string, hash: string): Promise<boolean>;
  generateAccessToken(payload: TokenPayload): string;
  generateRefreshToken(payload: TokenPayload): string;
  verifyAccessToken(token: string): TokenPayload;
  verifyRefreshToken(token: string): TokenPayload;
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}
