import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ValidateNested, IsString, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { CourtDto } from './court.dto';
import { CourtAvailabilityDto } from './courtavailability.dto';
import { CourtMediaDto } from './court_media.dto';

export class CreateCourtDto extends CourtDto {
  @ApiProperty({
    description: 'Availability of the court',
    type: [CourtAvailabilityDto],
    // required: true,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CourtAvailabilityDto)
  @IsOptional()
  availability: CourtAvailabilityDto[];

  @ApiProperty({
    description: 'IDs of the games for the court',
    // required: true,
    type: [String],
  })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  games: string[];
}