//app.module.ts
import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { CourtModule } from './court/court.module';
import { BookingModule } from './booking/booking.module';
import { PaymentModule } from './payment/payment.module';
import { SlotModule } from './slot/slot.module';
import { GameModule } from './game/game.module';


@Module({
  imports: [AuthModule, UserModule, PrismaModule, ConfigModule.forRoot({}), CourtModule, BookingModule, PaymentModule, SlotModule, GameModule],
})
export class AppModule {}
