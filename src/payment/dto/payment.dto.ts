import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { PAYMENT_METHOD, PAYMENT_STATUS } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class PaymentDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'The booking ID for the payment',
    example: 'booking1234',
  })
  booking_id: string;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({ description: 'The amount to be paid', example: 100.0 })
  payment_amount: number;

  @ApiProperty({
    description: 'The payment method used',
    enum: PAYMENT_METHOD,
    example: PAYMENT_METHOD.ONLINE,
  })
  @IsEnum(PAYMENT_METHOD)
  payment_method: PAYMENT_METHOD;
}
