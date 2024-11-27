import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsDate, IsNotEmpty, IsString } from "class-validator";
import { SlotDto } from "../../slot/dto/slot.dto";
import { TimeDto } from "../../slot/dto/time.dto";

export class UpdateBookingDto extends TimeDto{    
    
    @ApiProperty({ description: 'Booking ID to update', required: true })
    @IsNotEmpty()
    booking_id : string;
    
}