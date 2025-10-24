import { query } from '../db/pool';
import { Chapter } from '../models';

export class ChapterRepository {
  async create(
    bookId: string,
    title: string,
    content: string,
    chapterNumber: number,
    isPublished: boolean
  ): Promise<Chapter> {
    const result = await query<Chapter>(
      `INSERT INTO chapters (book_id, title, content, chapter_number, is_published) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [bookId, title, content, chapterNumber, isPublished]
    );
    return result[0];
  }

  async findById(id: string): Promise<Chapter | null> {
    const result = await query<Chapter>('SELECT * FROM chapters WHERE id = $1', [id]);
    return result[0] || null;
  }

  async findByBookId(bookId: string): Promise<Chapter[]> {
    return await query<Chapter>(
      'SELECT * FROM chapters WHERE book_id = $1 ORDER BY chapter_number ASC',
      [bookId]
    );
  }

  async findByBookIdAndChapterNumber(bookId: string, chapterNumber: number): Promise<Chapter | null> {
    const result = await query<Chapter>(
      'SELECT * FROM chapters WHERE book_id = $1 AND chapter_number = $2',
      [bookId, chapterNumber]
    );
    return result[0] || null;
  }

  async update(
    id: string,
    updates: {
      title?: string;
      content?: string;
      chapter_number?: number;
      is_published?: boolean;
    }
  ): Promise<Chapter | null> {
    const fields: string[] = [];
    const params: unknown[] = [];
    let paramIndex = 1;

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = $${paramIndex}`);
        params.push(value);
        paramIndex++;
      }
    });

    if (fields.length === 0) {
      return this.findById(id);
    }

    params.push(id);
    const sql = `UPDATE chapters SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;

    const result = await query<Chapter>(sql, params);
    return result[0] || null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await query('DELETE FROM chapters WHERE id = $1', [id]);
    return (result as unknown as { rowCount: number }).rowCount > 0;
  }

  async countByBookId(bookId: string): Promise<number> {
    const result = await query<{ count: string }>(
      'SELECT COUNT(*) as count FROM chapters WHERE book_id = $1',
      [bookId]
    );
    return parseInt(result[0].count, 10);
  }
}


