import { Type } from 'class-transformer';
import { IsDate, IsDateString, IsNotEmpty, IsString } from 'class-validator';
import { TimeDto } from './time.dto';
import { ApiProperty } from '@nestjs/swagger';

export class SlotDto extends TimeDto {
  @ApiProperty({
    description: 'The ID of the court',
    type: String,
    example: 'court123',
  })
  @IsNotEmpty()
  @IsString()
  court_id: string;
}
