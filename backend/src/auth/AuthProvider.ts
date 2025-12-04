export interface AuthProvider {
  hashPassword(password: string): Promise<string>;
  comparePassword(password: string, hash: string): Promise<boolean>;
  generateToken(payload: TokenPayload): string;
  verifyToken(token: string): TokenPayload;
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}


