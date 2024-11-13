//app.module.ts
import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { CourtModule } from './court/court.module';


@Module({
  imports: [AuthModule, UserModule, PrismaModule, ConfigModule.forRoot({}), CourtModule],
})
export class AppModule {}
