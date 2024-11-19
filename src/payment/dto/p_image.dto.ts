import { IsNotEmpty, IsString, IsUrl } from "class-validator";

export class PImageDto {
    
    @IsString()
    @IsNotEmpty()
    booking_id: string;
    
    // @IsNotEmpty()
    // @IsUrl()
    image: string;
}