import { query } from '../db/pool';
import { ReadingHistory } from '../models';

export class ReadingHistoryRepository {
  async upsert(
    userId: string,
    chapterId: string,
    bookId: string,
    wordsRead: number
  ): Promise<ReadingHistory> {
    const result = await query<ReadingHistory>(
      `INSERT INTO reading_history (user_id, chapter_id, book_id, pages_read, last_read_at) 
             VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP) 
             ON CONFLICT (user_id, chapter_id) 
             DO UPDATE SET pages_read = $4, last_read_at = CURRENT_TIMESTAMP 
             RETURNING *`,
      [userId, chapterId, bookId, wordsRead]
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

  async findByUserIdWithProgress(userId: string): Promise<any[]> {
    return await query<any>(
      `SELECT 
                b.id as book_id,
                b.title as book_title,
                MAX(rh.last_read_at) as last_read_at,
                (SELECT c2.id FROM chapters c2 
                 JOIN reading_history rh2 ON rh2.chapter_id = c2.id 
                 WHERE rh2.book_id = b.id AND rh2.user_id = $1 
                 ORDER BY rh2.last_read_at DESC LIMIT 1) as chapter_id,
                (SELECT c2.title FROM chapters c2 
                 JOIN reading_history rh2 ON rh2.chapter_id = c2.id 
                 WHERE rh2.book_id = b.id AND rh2.user_id = $1 
                 ORDER BY rh2.last_read_at DESC LIMIT 1) as chapter_title,
                (SELECT c2.chapter_number FROM chapters c2 
                 JOIN reading_history rh2 ON rh2.chapter_id = c2.id 
                 WHERE rh2.book_id = b.id AND rh2.user_id = $1 
                 ORDER BY rh2.last_read_at DESC LIMIT 1) as chapter_number,
                COALESCE(SUM(c.word_count), 0)::integer as words_read,
                (SELECT COALESCE(SUM(c3.word_count), 0)::integer FROM chapters c3 WHERE c3.book_id = b.id) as total_words
             FROM reading_history rh
             JOIN books b ON rh.book_id = b.id
             JOIN chapters c ON rh.chapter_id = c.id
             WHERE rh.user_id = $1
             GROUP BY b.id, b.title
             ORDER BY MAX(rh.last_read_at) DESC`,
      [userId]
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

  async getMostReadBookByAuthorId(
    authorId: string
  ): Promise<{ id: string; title: string; read_count: number } | null> {
    const result = await query<{ id: string; title: string; read_count: string }>(
      `SELECT b.id, b.title, COUNT(DISTINCT rh.user_id) as read_count 
             FROM books b 
             LEFT JOIN reading_history rh ON b.id = rh.book_id 
             WHERE b.author_id = $1 
             GROUP BY b.id, b.title 
             HAVING COUNT(DISTINCT rh.user_id) > 0 
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
