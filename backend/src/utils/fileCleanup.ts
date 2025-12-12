import fs from 'fs';
import path from 'path';
import { logger } from './logger';

export class FileCleanupService {
    private uploadDir: string;

    constructor() {
        this.uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, '../../public/uploads');
    }

    extractFilenameFromUrl(url: string | undefined): string | null {
        if (!url) return null;

        if (url.startsWith('/uploads/')) {
            return url.replace('/uploads/', '');
        }

        if (url.includes('/uploads/')) {
            const parts = url.split('/uploads/');
            return parts[parts.length - 1];
        }

        return null;
    }

    async deleteFile(url: string | undefined): Promise<void> {
        const filename = this.extractFilenameFromUrl(url);
        if (!filename) {
            logger.debug('No filename extracted from URL, skipping deletion');
            return;
        }

        const filepath = path.join(this.uploadDir, filename);

        try {
            if (fs.existsSync(filepath)) {
                fs.unlinkSync(filepath);
                logger.info({ filepath }, 'Deleted file');
            } else {
                logger.debug({ filepath }, 'File does not exist, skipping deletion');
            }
        } catch (error) {
            logger.error({ error, filepath }, 'Failed to delete file');
        }
    }

    async deleteFileIfChanged(oldUrl: string | undefined, newUrl: string | undefined): Promise<void> {
        if (!oldUrl || oldUrl === newUrl) {
            return;
        }

        if (newUrl && this.extractFilenameFromUrl(oldUrl) === this.extractFilenameFromUrl(newUrl)) {
            return;
        }

        await this.deleteFile(oldUrl);
    }
}
