import { IsEnum, IsNotEmpty, IsNumber, IsString } from "class-validator"
import { PAYMENT_METHOD, Payment_Status } from '@prisma/client';


export class PaymentDto {
    
    @IsNotEmpty()
    @IsString()
    booking_id: string;
    
    @IsNotEmpty() 
    @IsNumber()
    payment_amount: number;
    
    @IsEnum(PAYMENT_METHOD)
    payment_method: PAYMENT_METHOD

}