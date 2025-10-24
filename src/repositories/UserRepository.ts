import { query } from '../db/pool';
import { User } from '../models';

export class UserRepository {
  async create(email: string, passwordHash: string, username: string, role: string): Promise<User> {
    const result = await query<User>(
      `INSERT INTO users (email, password_hash, username, role) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [email, passwordHash, username, role]
    );
    return result[0];
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await query<User>('SELECT * FROM users WHERE email = $1', [email]);
    return result[0] || null;
  }

  async findByUsername(username: string): Promise<User | null> {
    const result = await query<User>('SELECT * FROM users WHERE username = $1', [username]);
    return result[0] || null;
  }

  async findById(id: string): Promise<User | null> {
    const result = await query<User>('SELECT * FROM users WHERE id = $1', [id]);
    return result[0] || null;
  }

  async existsByEmail(email: string): Promise<boolean> {
    const result = await query<{ exists: boolean }>(
      'SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)',
      [email]
    );
    return result[0].exists;
  }

  async existsByUsername(username: string): Promise<boolean> {
    const result = await query<{ exists: boolean }>(
      'SELECT EXISTS(SELECT 1 FROM users WHERE username = $1)',
      [username]
    );
    return result[0].exists;
  }
}


