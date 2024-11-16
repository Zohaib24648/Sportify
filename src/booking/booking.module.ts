import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { JwtService } from '@nestjs/jwt';
import { CourtService } from 'src/court/court.service';
import { Module } from '@nestjs/common';

@Module({
  providers: [BookingService,JwtService,CourtService],
  controllers: [BookingController]
})
export class BookingModule {}

  


