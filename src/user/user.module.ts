//user/user.module.ts
import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { UploadService } from 'src/upload/upload.service';

@Module({
  imports: [AuthModule],
  controllers: [UserController],
  providers: [UserService,PrismaService,UploadService],
})
export class UserModule {}
