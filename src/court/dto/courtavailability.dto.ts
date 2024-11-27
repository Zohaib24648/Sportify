import { ApiProperty } from '@nestjs/swagger';
import { DAY } from '@prisma/client';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class CourtAvailabilityDto {
  
  
  @ApiProperty({
    description: 'The day of the week for the availability',
    example: 'monday', // You can replace this with your enum values
    enum: DAY,
  })
  @IsNotEmpty()
  day: DAY;


  @ApiProperty({
    description: 'The start time of the availability in HH:mm format',
    example: '09:00',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{2}:\d{2}$/, { message: 'start_time must be in HH:mm format' })
  start_time: string;


  @ApiProperty({
    description: 'The end time of the availability in HH:mm format',
    example: '17:00',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{2}:\d{2}$/, { message: 'end_time must be in HH:mm format' })
  end_time: string;
}
