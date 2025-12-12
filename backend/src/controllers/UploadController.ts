import { FastifyReply, FastifyRequest } from 'fastify';
import { successResponse } from '../utils/response';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

export class UploadController {
    private uploadDir: string;
    private maxFileSize: number;

    constructor() {
        this.uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, '../../public/uploads');
        this.maxFileSize = parseInt(process.env.MAX_FILE_SIZE || '5242880', 10);
    }

    async uploadImage(request: FastifyRequest, reply: FastifyReply): Promise<void> {
        const data = await request.file();

        if (!data) {
            return reply.code(400).send({
                success: false,
                message: 'Failas neįkeltas. Prašome pasirinkti failą.'
            });
        }

        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedMimeTypes.includes(data.mimetype)) {
            return reply.code(400).send({
                success: false,
                message: 'Netinkamas failo tipas. Leidžiami tik JPEG, PNG ir WEBP formatai.'
            });
        }

        // Check file size
        const fileBuffer = await data.toBuffer();
        if (fileBuffer.length > this.maxFileSize) {
            const maxSizeMB = (this.maxFileSize / 1024 / 1024).toFixed(1);
            return reply.code(400).send({
                success: false,
                message: `Failas per didelis. Maksimalus dydis: ${maxSizeMB}MB.`
            });
        }

        if (!fs.existsSync(this.uploadDir)) {
            fs.mkdirSync(this.uploadDir, { recursive: true });
        }

        const extension = path.extname(data.filename);
        const filename = `${randomUUID()}${extension}`;
        const filepath = path.join(this.uploadDir, filename);


        fs.writeFileSync(filepath, fileBuffer);

        const fileUrl = `/uploads/${filename}`;

        return reply.code(201).send(successResponse('Nuotrauka sėkmingai įkelta', { url: fileUrl }));
    }
}
