//court/court.module.ts
import { Module } from '@nestjs/common';
import { CourtController } from './court.controller';
import { CourtService } from './court.service';
import { JwtService } from '@nestjs/jwt';


@Module({
  controllers: [CourtController,],
  providers: [CourtService,JwtService],
})
export class CourtModule {}
