import { FastifyInstance } from 'fastify';
import { UploadController } from '../controllers/UploadController';
import { requireAuth } from '../auth/guards';

export async function uploadRoutes(
    fastify: FastifyInstance,
    uploadController: UploadController
): Promise<void> {
    fastify.post(
        '/upload',
        {
            preHandler: requireAuth,
            schema: {
                tags: ['Upload'],
                description: 'Upload an image',
                security: [{ bearerAuth: [] }],
                response: {
                    201: {
                        type: 'object',
                        properties: {
                            success: { type: 'boolean' },
                            message: { type: 'string' },
                            data: {
                                type: 'object',
                                properties: {
                                    url: { type: 'string' }
                                }
                            }
                        },
                    },
                },
            },
        },
        uploadController.uploadImage.bind(uploadController)
    );
}
