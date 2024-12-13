import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, Matches } from "class-validator";
import { CourtIdDto } from "src/review/dto/courtid.dto";

export class GetAvailableSlotsDto extends CourtIdDto {
    
@ApiProperty({ description: 'Date for which to get available slots', required: true ,example: '2025-12-09T00:00:00'})
@IsString()
@IsNotEmpty()
@Matches(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/, {
  message:
    'date must be a valid local ISO 8601 date-time string without timezone or offset EZ : 2024-11-27T08:00:00',
})
date: string;
}