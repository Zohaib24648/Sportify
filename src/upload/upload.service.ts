import {
    DeleteObjectCommand,
    GetObjectCommand,
    PutObjectCommand,
    S3Client,
  } from '@aws-sdk/client-s3';
  import { Injectable, InternalServerErrorException } from '@nestjs/common';
  import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
  
  @Injectable()
  export class UploadService {
    private readonly s3client = new S3Client({ region: process.env.AWS_REGION });
  
    // Upload a single file (image or video)
    async uploadFile(dto: Express.Multer.File) {
      const file = dto.buffer;
      const originalName = dto.originalname;
      const extension = originalName.substring(originalName.lastIndexOf('.'));
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `${timestamp}${extension}`;
  
      try {
        const result = await this.s3client.send(
          new PutObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: filename,
            Body: file,
            ContentType: dto.mimetype,
          }),
        );
  
        return { result, filename };
      } catch (error) {
        throw new InternalServerErrorException('Failed to upload file', error.message);
      }
    }
  
    // Upload multiple files (images or videos)
    async uploadFiles(files: Express.Multer.File[]) {
      const uploadResults = [];
  
      for (const file of files) {
        try {
          const uploadResult = await this.uploadFile(file);
          uploadResults.push(uploadResult);
        } catch (error) {
          console.error(`Failed to upload file ${file.originalname}:`, error.message);
        }
      }
  
      return uploadResults;
    }
  
    // Get a file URL
    async getFileUrl(filename: string) {
      try {
        const command = new GetObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: filename,
        });
        const url = await getSignedUrl(this.s3client, command, { expiresIn: 3600 });
        return url;
      } catch (err) {
        console.error('Error fetching file:', err);
        throw new InternalServerErrorException('Failed to get file URL', err.message);
      }
    }
  
    // Delete a file
    async deleteFile(filename: string) {
      try {
        const result = await this.s3client.send(
          new DeleteObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: filename,
          }),
        );
  
        return result;
      } catch (err) {
        console.error('Error deleting file:', err);
        throw new InternalServerErrorException('Failed to delete file', err.message);
      }
    }
  }