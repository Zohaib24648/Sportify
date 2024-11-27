import { Module } from '@nestjs/common';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { PrismaService } from '../prisma/prisma.service';
import { CourtService } from '../court/court.service';

@Module({
  controllers: [GameController],
  providers: [GameService,PrismaService,CourtService]
})
export class GameModule {}
