import { FastifyReply, FastifyRequest } from 'fastify';
import { successResponse } from '../utils/response';
import { messages } from '../utils/messages';
import fs from 'fs';
import path from 'path';
import { pipeline } from 'stream';
import util from 'util';
import { randomUUID } from 'crypto';

const pump = util.promisify(pipeline);

export class UploadController {
    async uploadImage(request: FastifyRequest, reply: FastifyReply): Promise<void> {
        const data = await request.file();

        if (!data) {
            return reply.code(400).send({ success: false, message: 'No file uploaded' });
        }

        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedMimeTypes.includes(data.mimetype)) {
            return reply.code(400).send({ success: false, message: 'Invalid file type. Only JPEG, PNG, WEBP allowed.' });
        }

        const uploadDir = path.join(__dirname, '../../public/uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const extension = path.extname(data.filename);
        const filename = `${randomUUID()}${extension}`;
        const filepath = path.join(uploadDir, filename);

        await pump(data.file, fs.createWriteStream(filepath));

        const fileUrl = `/uploads/${filename}`;

        return reply.code(201).send(successResponse('Image uploaded successfully', { url: fileUrl }));
    }
}
