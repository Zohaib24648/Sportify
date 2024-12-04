//payment.module.ts
import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { CourtService } from 'src/court/court.service';
import { SlotService } from 'src/slot/slot.service';
import { BookingService } from 'src/booking/booking.service';
import { MailService } from 'src/mail/mail.service';

@Module({
  controllers: [PaymentController],
  providers: [
    PaymentService,
    CourtService,
    SlotService,
    BookingService,
    MailService,
  ],
})
export class PaymentModule {}
