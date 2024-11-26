import { ApiProperty } from "@nestjs/swagger"
import { IsNumber } from "class-validator"

export class PaymentHandlerDto {
    

    @IsNumber()
    @ApiProperty({ description: 'Total amount of the booking', example: 200.00 })
    total_amount: number



    @IsNumber()
    @ApiProperty({ description: 'Amount that has already been paid', example: 50.00 })
    paid_amount: number


    @IsNumber()
    @ApiProperty({ description: 'Minimum down payment percentage', example: 20 })
    min_down_payment: number 
    
    @IsNumber()
    @ApiProperty({ description: 'Amount to be paid in this transaction', example: 100.00 })
    payment_amount: number

}