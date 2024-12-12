import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { time, timeStamp } from 'console';
import dayjs from 'dayjs';
import { timestamp } from 'rxjs';


@Injectable()
export class UploadService {

private readonly s3client = new S3Client({ region: process.env.AWS_REGION });



async uploadFile( dto: Express.Multer.File) {

    const file = dto.buffer;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    const filename = `${timestamp}.png`;
    console.log("Uploading file: ",filename)
  try {
    const result = await this.s3client.send(
        new PutObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: filename,
            Body: file,
        }),
    );

    return  result;
  } catch (error) {
    throw new InternalServerErrorException('Failed to upload file', error);

  }

}

async getFileUrl(filename:string) {
    try{
        const command = new GetObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: filename,
        });
        const url = await getSignedUrl(this.s3client, command, { expiresIn: 3600 });
        return url
    }catch(err){
        console.log("Error fetching file: ",err)
    }


}


async deleteFile(filename:string) {
    try{
       const result =  await this.s3client.send(
            new DeleteObjectCommand({
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: filename,
            }),
        );

        return result
    }catch(err){
        console.log("Error deleting file: ",err)
    }


}}
