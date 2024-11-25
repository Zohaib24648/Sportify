import { DAY } from '@prisma/client';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class CourtAvailabilityDto {
  @IsNotEmpty()
  day: DAY;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{2}:\d{2}$/, { message: 'start_time must be in HH:mm format' })
  start_time: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{2}:\d{2}$/, { message: 'end_time must be in HH:mm format' })
  end_time: string;
}
