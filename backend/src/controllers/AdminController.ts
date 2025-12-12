import { FastifyReply } from 'fastify';
import { AdminService } from '../services/AdminService';
import { successResponse } from '../utils/response';
import { AuthenticatedRequest } from '../auth/guards';
import { UserRole } from '../models';

export class AdminController {
    constructor(private adminService: AdminService) { }

    async getDashboardStats(_request: AuthenticatedRequest, reply: FastifyReply): Promise<void> {
        const stats = await this.adminService.getDashboardStats();
        return reply.code(200).send(successResponse('Statistika gauta', { stats }));
    }

    async getAllUsers(_request: AuthenticatedRequest, reply: FastifyReply): Promise<void> {
        const users = await this.adminService.getAllUsers();
        return reply.code(200).send(successResponse('Vartotojai gauti', { users }));
    }

    async updateUserRole(request: AuthenticatedRequest, reply: FastifyReply): Promise<void> {
        const { userId } = request.params as { userId: string };
        const { role } = request.body as { role: UserRole };
        const adminId = request.user!.userId;

        const user = await this.adminService.updateUserRole(userId, role, adminId);
        return reply.code(200).send(successResponse('Vaidmuo pakeistas', { user }));
    }

    async deleteUser(request: AuthenticatedRequest, reply: FastifyReply): Promise<void> {
        const { userId } = request.params as { userId: string };
        const adminId = request.user!.userId;

        await this.adminService.deleteUser(userId, adminId);
        return reply.code(200).send(successResponse('Vartotojas ištrintas'));
    }

    async getAllBooks(_request: AuthenticatedRequest, reply: FastifyReply): Promise<void> {
        const books = await this.adminService.getAllBooks();
        return reply.code(200).send(successResponse('Knygos gautos', { books }));
    }

    async deleteBook(request: AuthenticatedRequest, reply: FastifyReply): Promise<void> {
        const { bookId } = request.params as { bookId: string };

        await this.adminService.deleteBook(bookId);
        return reply.code(200).send(successResponse('Knyga ištrinta'));
    }

    async getAllComments(_request: AuthenticatedRequest, reply: FastifyReply): Promise<void> {
        const comments = await this.adminService.getAllComments();
        return reply.code(200).send(successResponse('Komentarai gauti', { comments }));
    }

    async deleteComment(request: AuthenticatedRequest, reply: FastifyReply): Promise<void> {
        const { commentId } = request.params as { commentId: string };

        await this.adminService.deleteComment(commentId);
        return reply.code(200).send(successResponse('Komentaras ištrintas'));
    }
}
