import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsUrl } from "class-validator";

export class PImageDto {
    
    @ApiProperty({ description: 'The booking ID related to the payment', example: 'booking1234' })
    @IsString()
    @IsNotEmpty()
    booking_id: string;
    
    

    @ApiProperty({ description: 'The URL of the payment receipt image', example: 'http://example.com/receipt.jpg' })
    // @IsNotEmpty()
    // @IsUrl()
    image: string;
}