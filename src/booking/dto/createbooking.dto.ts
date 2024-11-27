import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsDate, IsNotEmpty, IsString } from "class-validator";
import { SlotDto } from "../../slot/dto/slot.dto";

export class CreateBookingDto extends SlotDto {    
    
    @ApiProperty({ description: 'User ID', required: true })
    @IsNotEmpty()
    @IsString()
    user_id: string;
    
}