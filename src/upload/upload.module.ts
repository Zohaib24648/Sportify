import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';

@Module({
  controllers: [UploadController],
  providers: [UploadService],
  exports: [UploadService], // Export if used by other modules
})
export class UploadModule {}
