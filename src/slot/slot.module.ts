//slot module
import { Module } from '@nestjs/common';
import { SlotController } from './slot.controller';
import { SlotService } from './slot.service';
import { CourtService } from '../court/court.service';

@Module({
  controllers: [SlotController],
  providers: [SlotService,CourtService]
})
export class SlotModule {}
