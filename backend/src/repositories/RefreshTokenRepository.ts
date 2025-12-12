import { query } from '../db/pool';
import { RefreshToken } from '../models';

export class RefreshTokenRepository {
  async create(userId: string, token: string, expiresAt: Date): Promise<RefreshToken> {
    const result = await query<RefreshToken>(
      `INSERT INTO refresh_tokens (user_id, token, expires_at) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [userId, token, expiresAt]
    );
    return result[0];
  }

  async findByToken(token: string): Promise<RefreshToken | null> {
    const result = await query<RefreshToken>(
      'SELECT * FROM refresh_tokens WHERE token = $1 AND revoked = false',
      [token]
    );
    return result[0] || null;
  }

  async revokeToken(token: string): Promise<boolean> {
    const result = await query(
      'UPDATE refresh_tokens SET revoked = true WHERE token = $1',
      [token]
    );
    return (result as unknown as { rowCount: number }).rowCount > 0;
  }

  async revokeAllUserTokens(userId: string): Promise<void> {
    await query(
      'UPDATE refresh_tokens SET revoked = true WHERE user_id = $1',
      [userId]
    );
  }

  async deleteExpired(): Promise<void> {
    await query(
      'DELETE FROM refresh_tokens WHERE expires_at < CURRENT_TIMESTAMP'
    );
  }
}
