import { ApiProperty } from '@nestjs/swagger';
import { BOOKING_STATUS } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsArray, IsDate, IsEnum, IsOptional, IsString } from 'class-validator';
import { TimeDto } from 'src/slot/dto/time.dto';

export class BookingFiltersDto extends TimeDto {
  @ApiProperty({
    description: 'Booking status filter',
    enum: BOOKING_STATUS,
    required: false,
  })
  @IsOptional()
  @IsEnum(BOOKING_STATUS) // Validate against the Booking_Status enum
  status?: BOOKING_STATUS;

  @ApiProperty({ description: 'Search term for bookings', required: false })
  @IsOptional()
  @IsString() // Ensure it's a string
  searchTerm?: string; // For searching bookings
}
