//booking_moduler.ts
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { JwtService } from '@nestjs/jwt';
import { CourtService } from 'src/court/court.service';
import { Module } from '@nestjs/common';
import { SlotService } from 'src/slot/slot.service';
import { PaymentService } from 'src/payment/payment.service';
import { MailService } from 'src/mail/mail.service';
import { UploadService } from 'src/upload/upload.service';

@Module({
  providers: [
    BookingService,
    JwtService,
    CourtService,
    SlotService,
    PaymentService,
    MailService,
    UploadService
  ],
  controllers: [BookingController],
})
export class BookingModule {}
