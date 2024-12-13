import { Module } from '@nestjs/common';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CourtService } from 'src/court/court.service';
import { UploadService } from 'src/upload/upload.service';

@Module({
  controllers: [GameController],
  providers: [GameService, PrismaService, CourtService,UploadService],
})
export class GameModule {}
