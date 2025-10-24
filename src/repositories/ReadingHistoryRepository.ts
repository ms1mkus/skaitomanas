import { query } from '../db/pool';
import { ReadingHistory, ChapterWithBook } from '../models';

export class ReadingHistoryRepository {
  async upsert(
    userId: string,
    chapterId: string,
    bookId: string,
    progressPercentage: number
  ): Promise<ReadingHistory> {
    const result = await query<ReadingHistory>(
      `INSERT INTO reading_history (user_id, chapter_id, book_id, progress_percentage, last_read_at) 
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP) 
       ON CONFLICT (user_id, chapter_id) 
       DO UPDATE SET progress_percentage = $4, last_read_at = CURRENT_TIMESTAMP 
       RETURNING *`,
      [userId, chapterId, bookId, progressPercentage]
    );
    return result[0];
  }

  async findByUserId(userId: string, limit: number = 50): Promise<ReadingHistory[]> {
    return await query<ReadingHistory>(
      `SELECT * FROM reading_history 
       WHERE user_id = $1 
       ORDER BY last_read_at DESC 
       LIMIT $2`,
      [userId, limit]
    );
  }

  async findByUserIdWithChapters(userId: string, limit: number = 50): Promise<ChapterWithBook[]> {
    return await query<ChapterWithBook>(
      `SELECT DISTINCT ON (rh.book_id) c.*, b.title as book_title 
       FROM reading_history rh 
       JOIN chapters c ON rh.chapter_id = c.id 
       JOIN books b ON c.book_id = b.id 
       WHERE rh.user_id = $1 
       ORDER BY rh.book_id, rh.last_read_at DESC 
       LIMIT $2`,
      [userId, limit]
    );
  }

  async countUniqueReadersByAuthorId(authorId: string): Promise<number> {
    const result = await query<{ count: string }>(
      `SELECT COUNT(DISTINCT rh.user_id) as count 
       FROM reading_history rh 
       JOIN books b ON rh.book_id = b.id 
       WHERE b.author_id = $1`,
      [authorId]
    );
    return parseInt(result[0].count, 10);
  }

  async getMostReadBookByAuthorId(authorId: string): Promise<{ id: string; title: string; read_count: number } | null> {
    const result = await query<{ id: string; title: string; read_count: string }>(
      `SELECT b.id, b.title, COUNT(DISTINCT rh.user_id) as read_count 
       FROM books b 
       LEFT JOIN reading_history rh ON b.id = rh.book_id 
       WHERE b.author_id = $1 
       GROUP BY b.id, b.title 
       ORDER BY read_count DESC 
       LIMIT 1`,
      [authorId]
    );
    if (!result[0]) return null;
    return {
      id: result[0].id,
      title: result[0].title,
      read_count: parseInt(result[0].read_count, 10),
    };
  }
}


