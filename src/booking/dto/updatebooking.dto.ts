import { Type } from "class-transformer";
import { IsDate, IsNotEmpty, IsString } from "class-validator";
import { SlotDto } from "src/slot/dto/slot.dto";

export class UpdateBookingDto {    
    
    @IsNotEmpty()
    booking_id : string;
    
    @IsDate()
    @Type(() => Date)
    start_time : Date;
    
    @IsDate()
    @Type(() => Date)
    end_time : Date;
    
}