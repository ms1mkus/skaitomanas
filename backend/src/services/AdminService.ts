import { query } from '../db/pool';
import { UserRole } from '../models';
import { NotFoundError, ForbiddenError } from '../utils/errors';
import { messages } from '../utils/messages';

export class AdminService {
    async getDashboardStats(): Promise<{
        totalUsers: number;
        totalBooks: number;
        totalChapters: number;
        totalComments: number;
        usersByRole: { role: string; count: number }[];
        recentActivity: { date: string; users: number; books: number }[];
    }> {
        const usersResult = await query<{ count: string }>('SELECT COUNT(*) as count FROM users');
        const booksResult = await query<{ count: string }>('SELECT COUNT(*) as count FROM books');
        const chaptersResult = await query<{ count: string }>('SELECT COUNT(*) as count FROM chapters');
        const commentsResult = await query<{ count: string }>('SELECT COUNT(*) as count FROM comments');

        const roleStats = await query<{ role: string; count: string }>(
            `SELECT role, COUNT(*) as count FROM users GROUP BY role`
        );

        const recentActivity = await query<{ date: string; users: string; books: string }>(
            `SELECT 
                date_trunc('day', created_at)::date as date,
                COUNT(*) FILTER (WHERE true) as users,
                0 as books
             FROM users 
             WHERE created_at > NOW() - INTERVAL '7 days'
             GROUP BY date_trunc('day', created_at)
             ORDER BY date DESC
             LIMIT 7`
        );

        return {
            totalUsers: parseInt(usersResult[0].count, 10),
            totalBooks: parseInt(booksResult[0].count, 10),
            totalChapters: parseInt(chaptersResult[0].count, 10),
            totalComments: parseInt(commentsResult[0].count, 10),
            usersByRole: roleStats.map(r => ({ role: r.role, count: parseInt(r.count, 10) })),
            recentActivity: recentActivity.map(r => ({
                date: r.date,
                users: parseInt(r.users, 10),
                books: parseInt(r.books, 10)
            })),
        };
    }

    async getAllUsers(): Promise<any[]> {
        return await query<any>(
            `SELECT 
                u.id, u.email, u.username, u.role, u.created_at,
                (SELECT COUNT(*) FROM books WHERE author_id = u.id) as book_count,
                (SELECT COUNT(*) FROM comments WHERE user_id = u.id) as comment_count
             FROM users u
             ORDER BY u.created_at DESC`
        );
    }

    async updateUserRole(userId: string, newRole: UserRole, adminId: string): Promise<any> {
        if (userId === adminId) {
            throw new ForbiddenError('Negalite keisti savo vaidmens');
        }

        const user = await query<any>('SELECT * FROM users WHERE id = $1', [userId]);
        if (!user[0]) {
            throw new NotFoundError(messages.user.notFound);
        }

        const result = await query<any>(
            'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, email, username, role',
            [newRole, userId]
        );
        return result[0];
    }

    async deleteUser(userId: string, adminId: string): Promise<void> {
        if (userId === adminId) {
            throw new ForbiddenError('Negalite ištrinti savęs');
        }

        const user = await query<any>('SELECT * FROM users WHERE id = $1', [userId]);
        if (!user[0]) {
            throw new NotFoundError(messages.user.notFound);
        }

        await query('DELETE FROM users WHERE id = $1', [userId]);
    }

    async getAllBooks(): Promise<any[]> {
        return await query<any>(
            `SELECT 
                b.id, b.title, b.status, b.created_at,
                u.username as author_username,
                (SELECT COUNT(*) FROM chapters WHERE book_id = b.id) as chapter_count,
                (SELECT COALESCE(SUM(word_count), 0) FROM chapters WHERE book_id = b.id) as total_words
             FROM books b
             JOIN users u ON b.author_id = u.id
             ORDER BY b.created_at DESC`
        );
    }

    async deleteBook(bookId: string): Promise<void> {
        const book = await query<any>('SELECT * FROM books WHERE id = $1', [bookId]);
        if (!book[0]) {
            throw new NotFoundError(messages.book.notFound);
        }

        await query('DELETE FROM books WHERE id = $1', [bookId]);
    }

    async getAllComments(): Promise<any[]> {
        return await query<any>(
            `SELECT 
                c.id, c.content, c.created_at,
                u.username,
                ch.title as chapter_title,
                b.title as book_title
             FROM comments c
             JOIN users u ON c.user_id = u.id
             JOIN chapters ch ON c.chapter_id = ch.id
             JOIN books b ON ch.book_id = b.id
             ORDER BY c.created_at DESC
             LIMIT 100`
        );
    }

    async deleteComment(commentId: string): Promise<void> {
        const comment = await query<any>('SELECT * FROM comments WHERE id = $1', [commentId]);
        if (!comment[0]) {
            throw new NotFoundError(messages.comment.notFound);
        }

        await query('DELETE FROM comments WHERE id = $1', [commentId]);
    }
}
