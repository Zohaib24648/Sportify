import { Type } from "class-transformer";
import { IsDate, IsNotEmpty, IsString } from "class-validator";
import { SlotDto } from "src/slot/dto/slot.dto";

export class CreateBookingDto extends SlotDto {    
    
    @IsNotEmpty()
    @IsString()
    user_id: string;
    
}