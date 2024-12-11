import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsUUID } from "class-validator";

export class BookingIdDto {
    @ApiProperty({
        description: 'UUID of the Booking',
        example: '65c21056-2f81-4aa9-a10c-a7c349c750c9',
    })
    @IsNotEmpty()
    @IsUUID()
    booking_id: string;
}