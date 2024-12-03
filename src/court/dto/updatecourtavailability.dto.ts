import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class updateCourtAvailabilityDto {
  @ApiProperty({
    description: 'The start time of the availability in HH:mm format',
    example: '09:00',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{2}:\d{2}$/, { message: 'start_time must be in HH:mm format' })
  start_time: string;

  @ApiProperty({
    description: 'The end time of the availability in HH:mm format',
    example: '17:00',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{2}:\d{2}$/, { message: 'end_time must be in HH:mm format' })
  end_time: string;
}
