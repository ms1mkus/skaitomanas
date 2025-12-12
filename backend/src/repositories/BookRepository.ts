import { query } from '../db/pool';
import { Book, BookWithAuthor } from '../models';

export class BookRepository {
  async create(
    title: string,
    description: string,
    authorId: string,
    coverImageUrl: string | undefined,
    language: string,
    tags: string[],
    status: string
  ): Promise<Book> {
    const result = await query<Book>(
      `INSERT INTO books (title, description, author_id, cover_image_url, language, tags, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [title, description, authorId, coverImageUrl, language, tags, status]
    );
    return result[0];
  }

  async findById(id: string): Promise<Book | null> {
    const result = await query<Book>('SELECT * FROM books WHERE id = $1', [id]);
    return result[0] || null;
  }

  async findByIdWithAuthor(id: string): Promise<BookWithAuthor | null> {
    const result = await query<BookWithAuthor>(
      `SELECT b.*, u.username as author_username, u.email as author_email 
       FROM books b 
       JOIN users u ON b.author_id = u.id 
       WHERE b.id = $1`,
      [id]
    );
    return result[0] || null;
  }

  async findAll(filters: {
    tag?: string;
    author?: string;
    language?: string;
    limit: number;
    offset: number;
  }): Promise<BookWithAuthor[]> {
    let sql = `SELECT b.*, u.username as author_username, u.email as author_email 
               FROM books b 
               JOIN users u ON b.author_id = u.id 
               WHERE b.status = 'published'`;
    const params: unknown[] = [];
    let paramIndex = 1;

    if (filters.tag) {
      sql += ` AND $${paramIndex} = ANY(b.tags)`;
      params.push(filters.tag);
      paramIndex++;
    }

    if (filters.author) {
      sql += ` AND u.username ILIKE $${paramIndex}`;
      params.push(`%${filters.author}%`);
      paramIndex++;
    }

    if (filters.language) {
      sql += ` AND b.language = $${paramIndex}`;
      params.push(filters.language);
      paramIndex++;
    }

    sql += ` ORDER BY b.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(filters.limit, filters.offset);

    return await query<BookWithAuthor>(sql, params);
  }

  async update(
    id: string,
    updates: {
      title?: string;
      description?: string;
      cover_image_url?: string;
      language?: string;
      tags?: string[];
      status?: string;
    }
  ): Promise<Book | null> {
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
    const sql = `UPDATE books SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;

    const result = await query<Book>(sql, params);
    return result[0] || null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await query('DELETE FROM books WHERE id = $1', [id]);
    return (result as unknown as { rowCount: number }).rowCount > 0;
  }

  async findByAuthorId(authorId: string): Promise<Book[]> {
    return await query<Book>('SELECT * FROM books WHERE author_id = $1 ORDER BY created_at DESC', [
      authorId,
    ]);
  }

  async findSimilar(
    bookId: string,
    language: string,
    tags: string[],
    limit: number
  ): Promise<BookWithAuthor[]> {
    return await query<BookWithAuthor>(
      `SELECT b.*, u.username as author_username, u.email as author_email 
       FROM books b 
       JOIN users u ON b.author_id = u.id 
       WHERE b.id != $1 
         AND b.status = 'published'
         AND (b.language = $2 OR b.tags && $3::text[])
       ORDER BY 
         CASE WHEN b.language = $2 THEN 2 ELSE 0 END +
         CASE WHEN b.tags && $3::text[] THEN 1 ELSE 0 END DESC,
         b.created_at DESC
       LIMIT $4`,
      [bookId, language, tags, limit]
    );
  }
}
