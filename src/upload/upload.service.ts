import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UploadService {

private readonly s3client = new S3Client({ region: process.env.AWS_REGION });



async uploadFile(filename:string, file: Buffer) {
    await this.s3client.send(
        new PutObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: filename,
            Body: file,
        }),
    );

}}
