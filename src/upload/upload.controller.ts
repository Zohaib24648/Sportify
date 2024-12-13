import { Body, Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { AnyFilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';

@Controller('upload')
export class UploadController {

    constructor(private readonly uploadService: UploadService) {}
    @Post('upload')
@UseInterceptors(FileInterceptor('file'))
async uploadFile(@UploadedFile() dto: Express.Multer.File) {
    return await this.uploadService.uploadFile(dto);
}

    @Post('fetch')
async getFile(@Body() dto : any) {
    return await this.uploadService.getFileUrl(dto.filename);
}


@Post('delete')
async deleteFile(@Body() dto : any) {
    return await this.uploadService.deleteFile(dto.filename);
}


}

 