# Deployment Guide

This guide covers deployment considerations for the Skaitomanas reading platform, with a focus on file upload functionality.

## File Storage Configuration

### Local Filesystem (Default)

The application stores uploaded book cover images in the local filesystem by default.

**Configuration:**
```bash
UPLOAD_DIR=public/uploads
MAX_FILE_SIZE=5242880  # 5MB in bytes
```

**Important Considerations:**
- Files are stored in `backend/public/uploads/`
- Ensure this directory has write permissions
- Files are served via `@fastify/static` at `/uploads/*`
- **Backup Strategy Required**: Set up regular backups of the uploads directory

### Docker Deployment

When deploying with Docker, mount a persistent volume for uploads:

```yaml
# docker-compose.yml example
services:
  backend:
    image: your-backend-image
    volumes:
      - ./uploads:/app/public/uploads
    environment:
      - UPLOAD_DIR=/app/public/uploads
      - MAX_FILE_SIZE=5242880
```

**Key Points:**
- Mount a named volume or bind mount for persistence
- Files will survive container restarts
- Consider using a shared volume for multi-instance deployments

### Cloud Storage (Recommended for Production)

For production deployments, consider migrating to cloud storage:

**Options:**
- **AWS S3**: Industry standard, highly scalable
- **Google Cloud Storage**: Good integration with GCP
- **Azure Blob Storage**: Best for Azure deployments
- **Cloudflare R2**: S3-compatible, no egress fees

**Migration Steps:**
1. Install cloud storage SDK (e.g., `@aws-sdk/client-s3`)
2. Create a new `CloudStorageService` implementing the same interface
3. Update `UploadController` to use cloud storage
4. Configure environment variables for cloud credentials
5. Migrate existing files from local storage to cloud

**Benefits:**
- Automatic redundancy and backups
- CDN integration for faster delivery
- Scalable without server storage limits
- No server disk space concerns

## Environment Variables

### Required Variables

```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production

# Server
PORT=3000
NODE_ENV=production
```

### Upload Configuration

```bash
# Upload directory (relative to backend root or absolute path)
UPLOAD_DIR=public/uploads

# Maximum file size in bytes
# 1MB = 1048576, 5MB = 5242880, 10MB = 10485760
MAX_FILE_SIZE=5242880
```

## File Cleanup

The application automatically cleans up orphaned files:

- **Book Deletion**: Cover image is deleted when book is removed
- **Cover Replacement**: Old cover is deleted when a new one is uploaded

**Manual Cleanup:**
If you need to clean up orphaned files manually:

```bash
# Find files not referenced in database
cd backend/public/uploads
# Compare with database cover_image_url values
# Delete unreferenced files
```

## CDN Integration

For better performance, serve uploaded files through a CDN:

1. **Upload to Origin**: Files uploaded to your server or cloud storage
2. **CDN Configuration**: Configure CDN to cache `/uploads/*` paths
3. **URL Rewriting**: Update `cover_image_url` to use CDN domain

**Example with Cloudflare:**
```
Original: https://api.example.com/uploads/image.jpg
CDN:      https://cdn.example.com/uploads/image.jpg
```

## Security Considerations

### File Validation

The application validates:
- ✅ File type (JPEG, PNG, WEBP only)
- ✅ File size (configurable, default 5MB)
- ✅ Random UUID filenames (prevents overwrites)

### Additional Recommendations

1. **Rate Limiting**: Implement upload rate limits per user
2. **Virus Scanning**: Consider integrating antivirus scanning
3. **Image Optimization**: Resize/compress images on upload
4. **HTTPS Only**: Always use HTTPS in production
5. **CORS Configuration**: Restrict allowed origins

## Backup Strategy

### Local Storage Backups

```bash
# Daily backup script example
#!/bin/bash
BACKUP_DIR=/backups/uploads
UPLOAD_DIR=/app/backend/public/uploads
DATE=$(date +%Y%m%d)

tar -czf $BACKUP_DIR/uploads-$DATE.tar.gz $UPLOAD_DIR

# Keep only last 30 days
find $BACKUP_DIR -name "uploads-*.tar.gz" -mtime +30 -delete
```

### Cloud Storage Backups

Most cloud providers offer automatic versioning and backup:
- **AWS S3**: Enable versioning and lifecycle policies
- **GCS**: Enable object versioning
- **Azure**: Use blob snapshots

## Monitoring

Monitor these metrics:

- Upload success/failure rates
- Average file sizes
- Total storage usage
- Upload response times
- Failed cleanup operations (check logs)

## Migration Checklist

Before deploying to production:

- [ ] Set strong JWT secrets
- [ ] Configure `NODE_ENV=production`
- [ ] Set up persistent storage (volume or cloud)
- [ ] Configure backup strategy
- [ ] Test file upload and deletion
- [ ] Verify file cleanup on book deletion
- [ ] Set appropriate `MAX_FILE_SIZE`
- [ ] Configure CDN (optional but recommended)
- [ ] Set up monitoring and alerts
- [ ] Test disaster recovery procedures

## Troubleshooting

### Uploads Failing

1. Check directory permissions: `ls -la backend/public/uploads`
2. Verify `UPLOAD_DIR` environment variable
3. Check disk space: `df -h`
4. Review logs for error messages

### Files Not Cleaning Up

1. Check logs for cleanup errors
2. Verify file paths match database URLs
3. Ensure application has delete permissions

### Performance Issues

1. Consider image optimization/resizing
2. Implement CDN for file delivery
3. Move to cloud storage for better scalability
4. Add upload queue for large files
