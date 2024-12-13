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
import { AdminModule } from './admin/admin.module';
import { MailModule } from './mail/mail.module';
import { UploadController } from './upload/upload.controller';
import { UploadModule } from './upload/upload.module';
import { MediaService } from './media/media.service';
import { MediaController } from './media/media.controller';
import { MediaModule } from './media/media.module';
import { ReviewController } from './review/review.controller';
import { ReviewModule } from './review/review.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    PrismaModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    CourtModule,
    BookingModule,
    PaymentModule,
    SlotModule,
    GameModule,
    AdminModule,
    MailModule,
    ReviewModule,
    UploadModule,
    MediaModule,
  ],
  controllers: [UploadController, MediaController,ReviewController],
  providers: [MediaService],
})
export class AppModule {}
