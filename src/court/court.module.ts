//court/court.module.ts
import { Module } from '@nestjs/common';
import { CourtController } from './court.controller';
import { CourtService } from './court.service';
import { JwtService } from '@nestjs/jwt';
import { UploadService } from 'src/upload/upload.service';

@Module({
  controllers: [CourtController],
  providers: [CourtService, JwtService,UploadService],
})
export class CourtModule {}
