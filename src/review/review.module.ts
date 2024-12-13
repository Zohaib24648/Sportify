import { Module } from '@nestjs/common';
import { ReviewService } from './review.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [ReviewService, PrismaService],
  exports: [ReviewService],
})
export class ReviewModule {

}
