import { Type } from "class-transformer";
import { IsDate, IsNotEmpty, IsString } from "class-validator";
import { SlotDto } from "src/slot/dto/slot.dto";
import { TimeDto } from "src/slot/dto/time.dto";

export class UpdateBookingDto extends TimeDto{    
    
    @IsNotEmpty()
    booking_id : string;
    
}