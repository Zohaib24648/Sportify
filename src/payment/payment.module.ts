//payment.module.ts
import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { CourtService } from '../court/court.service';
import { SlotService } from '../slot/slot.service';
import { BookingService } from '../booking/booking.service';

@Module({
  controllers: [PaymentController],
  providers: [PaymentService,CourtService,SlotService,BookingService],
})
export class PaymentModule {}
