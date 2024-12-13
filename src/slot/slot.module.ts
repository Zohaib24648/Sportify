//slot module
import { Module } from '@nestjs/common';
import { SlotController } from './slot.controller';
import { SlotService } from './slot.service';
import { CourtService } from 'src/court/court.service';
import { UploadService } from 'src/upload/upload.service';

@Module({
  controllers: [SlotController],
  providers: [SlotService, CourtService, UploadService],
})
export class SlotModule {}
