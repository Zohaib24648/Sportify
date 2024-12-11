import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { SlotDto } from 'src/slot/dto/slot.dto';

export class CreateBookingDto extends SlotDto {
  @ApiProperty({ description: 'UUID of the User',example:"65c21056-2f81-4aa9-a10c-a7c349c750c9" })
  @IsNotEmpty()
  @IsUUID()
  user_id: string;
}
