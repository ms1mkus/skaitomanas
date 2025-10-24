import { query } from '../db/pool';
import { Comment, CommentWithUser } from '../models';

export class CommentRepository {
  async create(chapterId: string, userId: string, content: string): Promise<Comment> {
    const result = await query<Comment>(
      `INSERT INTO comments (chapter_id, user_id, content) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [chapterId, userId, content]
    );
    return result[0];
  }

  async findById(id: string): Promise<Comment | null> {
    const result = await query<Comment>('SELECT * FROM comments WHERE id = $1', [id]);
    return result[0] || null;
  }

  async findByChapterId(chapterId: string): Promise<CommentWithUser[]> {
    return await query<CommentWithUser>(
      `SELECT c.*, u.username 
       FROM comments c 
       JOIN users u ON c.user_id = u.id 
       WHERE c.chapter_id = $1 
       ORDER BY c.created_at DESC`,
      [chapterId]
    );
  }

  async update(id: string, content: string): Promise<Comment | null> {
    const result = await query<Comment>(
      'UPDATE comments SET content = $1 WHERE id = $2 RETURNING *',
      [content, id]
    );
    return result[0] || null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await query('DELETE FROM comments WHERE id = $1', [id]);
    return (result as unknown as { rowCount: number }).rowCount > 0;
  }

  async countByAuthorId(authorId: string): Promise<number> {
    const result = await query<{ count: string }>(
      `SELECT COUNT(*) as count 
       FROM comments c 
       JOIN chapters ch ON c.chapter_id = ch.id 
       JOIN books b ON ch.book_id = b.id 
       WHERE b.author_id = $1`,
      [authorId]
    );
    return parseInt(result[0].count, 10);
  }
}


