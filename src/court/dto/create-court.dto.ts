import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ValidateNested, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { CourtDto } from './court.dto';
import { CourtAvailabilityDto } from './courtavailability.dto';
import { CourtMediaDto } from './court_media.dto';

export class CreateCourtDto extends CourtDto {
  @ApiProperty({
    description: 'Availability of the court',
    type: [CourtAvailabilityDto],
    required: true,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CourtAvailabilityDto)
  availability: CourtAvailabilityDto[];

  @ApiProperty({
    description: 'Media of the court',
    type: [CourtMediaDto],
    required: true,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CourtMediaDto)
  media: CourtMediaDto[];

  @ApiProperty({
    description: 'IDs of the games for the court',
    required: true,
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  games: string[];
}