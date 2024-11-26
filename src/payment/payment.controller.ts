//payment.controller.ts
import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentDto } from './dto/payment.dto';
import { PImageDto } from './dto/p_image.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Payments')
@Controller('payment')
export class PaymentController {
    constructor (private readonly paymentService: PaymentService) {}



    @ApiOperation({ summary: 'Create a new payment for a booking' })
    @ApiResponse({ status: 201, description: 'Payment created successfully' })
    @ApiResponse({ status: 400, description: 'Bad request' })
 //Create Payment
 @Post('create_payment')
 async createPayment(@Body() dto: PaymentDto) {
   return this.paymentService.createPayment(dto);
   }


   @ApiOperation({ summary: 'Retrieve all payments' })
   @ApiResponse({ status: 200, description: 'List of payments retrieved successfully' })
 //Get Payments
 @Get('get_payments')
 async getPayments() {
   return this.paymentService.getPayments();
   }


   @ApiOperation({ summary: 'Get payments filtered by status' })
   @ApiResponse({ status: 200, description: 'List of payments by status retrieved successfully' })
   @ApiResponse({ status: 404, description: 'No payments found with the specified status' })
  //Get Payment By Payment Status
  @Get('get_payment_by_status/:status')
  async getPaymentByStatus(@Param('status') status: string) {
    return this.paymentService.getPaymetByStatus(status);
  }

 //Get Payment By Id
 @ApiOperation({ summary: 'Retrieve payment details by ID' })
 @ApiResponse({ status: 200, description: 'Payment retrieved successfully' })
 @ApiResponse({ status: 404, description: 'Payment not found' })
 @Get('get_payment_by_id/:id')
 async getPaymentById(@Param('id') id: string) {
   return this.paymentService.getPaymentById(id);
   }


   @ApiOperation({ summary: 'Update an existing payment' })
   @ApiResponse({ status: 200, description: 'Payment updated successfully' })
   @ApiResponse({ status: 404, description: 'Payment not found' })
   @ApiResponse({ status: 400, description: 'Invalid payment amount' })
 //Update Payment
 @Put('update_payment/:id')
 async updatePayment(@Param('id') id: string, @Body() payment: PaymentDto) {
   return this.paymentService.updatePayment(id, payment);
   }



   @Put('upload_payment_receipt')
   @ApiOperation({ summary: 'Upload a payment receipt (image)' })
   @ApiResponse({ status: 200, description: 'Payment image uploaded successfully' })
   @ApiResponse({ status: 400, description: 'Invalid booking ID or image' })
 @Put('upload_payment_receipt')
 async uploadPaymentReceipt(@Body() dto : PImageDto) {
   console.log(dto);
   return this.paymentService.uploadPaymentImage(dto);
   }


   @ApiOperation({ summary: 'Verify a payment by ID' })
   @ApiResponse({ status: 200, description: 'Payment verified successfully' })
   @ApiResponse({ status: 404, description: 'Payment not found' })   
 @Put('verify_payment/:id')
 async verifyPayment(@Param('id') id : string) {
   console.log(id);
   return this.paymentService.verifyPayment(id);
   }
}
