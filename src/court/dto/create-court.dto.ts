import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CourtDto } from './court.dto';
import { CourtAvailabilityDto } from './courtavailability.dto';

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
}