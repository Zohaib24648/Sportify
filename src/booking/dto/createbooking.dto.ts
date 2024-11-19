import { IsDate, IsNotEmpty, IsString } from "class-validator";

export class CreateBookingDto {    
    
    @IsNotEmpty()
    @IsString()
    user_id: string;
    
    @IsNotEmpty()
    @IsString()
    court_id: string;
    
    @IsNotEmpty()
    @IsDate()
    start_time: Date;
    
    @IsNotEmpty()
    @IsDate()
    end_time: Date;
}