import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsUrl } from "class-validator";

export class PImageDto {
    
    @ApiProperty({ description: 'The payment ID related to the payment', example: 'booking1234' })
    @IsString()
    @IsNotEmpty()
    payment_id: string;
    
    

    @ApiProperty({ description: 'The URL of the payment receipt image', example: 'http://example.com/receipt.jpg' })
    @IsString()
    @IsNotEmpty()
    // @IsUrl()
    image: string;
}