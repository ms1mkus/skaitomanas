import { FastifyInstance } from 'fastify';
import { AdminController } from '../controllers/AdminController';
import { requireAuth, requireRole } from '../auth/guards';
import { UserRole } from '../models';

export function registerAdminRoutes(
    app: FastifyInstance,
    adminController: AdminController
): void {
    app.get(
        '/admin/stats',
        { preHandler: [requireAuth, requireRole([UserRole.ADMIN])] },
        adminController.getDashboardStats.bind(adminController)
    );

    app.get(
        '/admin/users',
        { preHandler: [requireAuth, requireRole([UserRole.ADMIN])] },
        adminController.getAllUsers.bind(adminController)
    );

    app.patch(
        '/admin/users/:userId/role',
        { preHandler: [requireAuth, requireRole([UserRole.ADMIN])] },
        adminController.updateUserRole.bind(adminController)
    );

    app.delete(
        '/admin/users/:userId',
        { preHandler: [requireAuth, requireRole([UserRole.ADMIN])] },
        adminController.deleteUser.bind(adminController)
    );

    app.get(
        '/admin/books',
        { preHandler: [requireAuth, requireRole([UserRole.ADMIN])] },
        adminController.getAllBooks.bind(adminController)
    );

    app.delete(
        '/admin/books/:bookId',
        { preHandler: [requireAuth, requireRole([UserRole.ADMIN])] },
        adminController.deleteBook.bind(adminController)
    );

    app.get(
        '/admin/comments',
        { preHandler: [requireAuth, requireRole([UserRole.ADMIN])] },
        adminController.getAllComments.bind(adminController)
    );

    app.delete(
        '/admin/comments/:commentId',
        { preHandler: [requireAuth, requireRole([UserRole.ADMIN])] },
        adminController.deleteComment.bind(adminController)
    );
}
