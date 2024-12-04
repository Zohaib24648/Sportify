import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsString, Matches } from 'class-validator';

export class TimeDto {
  @ApiProperty({
    description: 'Start time of the slot in ISO 8601 format (without timezone)',
    example: '2024-11-27T08:00:00',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/, {
    message:
      'start_time must be a valid local ISO 8601 date-time string without timezone or offset EZ : 2024-11-27T08:00:00',
  })
  start_time: string;

  @ApiProperty({
    description: 'End time of the slot in ISO 8601 format (without timezone)',
    example: '2024-11-27T09:00:00',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/, {
    message:
      'end_time must be a valid local ISO 8601 date-time string without timezone or offset EZ : 2024-11-27T08:00:00',
  })
  end_time: string;
}
