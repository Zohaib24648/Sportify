import { Booking_Status } from "@prisma/client";
import { Type } from "class-transformer";
import {
    IsArray,
    IsDate,
    IsEnum,
    IsOptional,
    IsString,
} from "class-validator";

export class BookingFiltersDto {
    @IsOptional()
    @IsDate()
    @Type(() => Date)
    start_time?: Date;

    @IsOptional()
    @IsDate()
    @Type(() => Date)
    end_time?: Date;

    @IsOptional()
    @IsEnum(Booking_Status) // Validate against the Booking_Status enum
    status?: Booking_Status;

    @IsOptional()
    @IsString() // Single string instead of an array
    gameTypes?: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true }) // Ensure all elements are strings
    courtTypes?: string[]; // List of court spec names or values

    @IsOptional()
    @IsString() // Ensure it's a string
    searchTerm?: string; // For searching bookings
}
