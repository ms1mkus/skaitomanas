import { query } from '../db/pool';
import { Collection, BookWithAuthor } from '../models';

export class CollectionRepository {
  async add(userId: string, bookId: string): Promise<Collection> {
    const result = await query<Collection>(
      `INSERT INTO collections (user_id, book_id) 
       VALUES ($1, $2) 
       RETURNING *`,
      [userId, bookId]
    );
    return result[0];
  }

  async remove(userId: string, bookId: string): Promise<boolean> {
    const result = await query('DELETE FROM collections WHERE user_id = $1 AND book_id = $2', [
      userId,
      bookId,
    ]);
    return (result as unknown as { rowCount: number }).rowCount > 0;
  }

  async findByUserId(userId: string): Promise<BookWithAuthor[]> {
    return await query<BookWithAuthor>(
      `SELECT b.*, u.username as author_username, u.email as author_email 
       FROM collections c 
       JOIN books b ON c.book_id = b.id 
       JOIN users u ON b.author_id = u.id 
       WHERE c.user_id = $1 
       ORDER BY c.created_at DESC`,
      [userId]
    );
  }

  async exists(userId: string, bookId: string): Promise<boolean> {
    const result = await query<{ exists: boolean }>(
      'SELECT EXISTS(SELECT 1 FROM collections WHERE user_id = $1 AND book_id = $2)',
      [userId, bookId]
    );
    return result[0].exists;
  }
}
