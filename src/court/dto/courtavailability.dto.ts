import { ApiProperty } from '@nestjs/swagger';
import { DAY } from '@prisma/client';
import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { updateCourtAvailabilityDto } from './updatecourtavailability.dto';

export class CourtAvailabilityDto extends updateCourtAvailabilityDto {
  @ApiProperty({
    description: 'The day of the week for the availability',
    example: 'monday', // You can replace this with your enum values
    enum: DAY,
  })
  @IsNotEmpty()
  day: DAY;
}
