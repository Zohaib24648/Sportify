import { ApiProperty } from "@nestjs/swagger";
import { BOOKING_STATUS } from "@prisma/client";
import { Type } from "class-transformer";
import {
    IsArray,
    IsDate,
    IsEnum,
    IsOptional,
    IsString,
} from "class-validator";

export class BookingFiltersDto {
    @ApiProperty({ description: 'Start time of the booking', required: false })
    @IsOptional()
    @IsDate()
    @Type(() => Date)
    start_time?: Date;


@ApiProperty({ description: 'End time of the booking', required: false })
    @IsOptional()
    @IsDate()
    @Type(() => Date)
    end_time?: Date;


    @ApiProperty({ description: 'Booking status filter', enum: BOOKING_STATUS, required: false })
    @IsOptional()
    @IsEnum(BOOKING_STATUS) // Validate against the Booking_Status enum
    status?: BOOKING_STATUS;


    @IsOptional()
    @IsString() // Single string instead of an array
    gameTypes?: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true }) // Ensure all elements are strings
    courtTypes?: string[]; // List of court spec names or values

    @ApiProperty({ description: 'Search term for bookings', required: false })
    @IsOptional()
    @IsString() // Ensure it's a string
    searchTerm?: string; // For searching bookings
}
