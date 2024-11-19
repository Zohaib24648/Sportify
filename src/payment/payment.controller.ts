//payment.controller.ts
import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { PaymentService } from './payment.service';

@Controller('payment')
export class PaymentController {
    constructor (private readonly paymentService: PaymentService) {}



 //Create Payment
 @Post('create_payment')
 async createPayment(@Body() payment: any) {
   return this.paymentService.createPayment(payment.booking_id, payment.payment_amount, payment.payment_method);
   }

 //Get Payments
 @Get('get_payments')
 async getPayments() {
   return this.paymentService.getPayments();
   }

  //  //Get Pending Payments
  // @Get('get_pending_payments')
  // async getPendingPayments() {
  //   return this.paymentService.getpendingPayments();
  //   }

  //Get Payment By Payment Status
  @Get('get_payment_by_status/:status')
  async getPaymentByStatus(@Param('status') status: string) {
    return this.paymentService.getPaymetByStatus(status);
  }

 //Get Payment By Id
 @Get('get_payment_by_id/:id')
 async getPaymentById(@Param('id') id: string) {
   return this.paymentService.getPaymentById(id);
   }

 //Update Payment
 @Put('update_payment/:id')
 async updatePayment(@Param('id') id: string, @Body() payment: any) {
   return this.paymentService.updatePayment(id, payment);
   }

 @Put('upload_payment_receipt')
 async uploadPaymentReceipt(@Body() dto : any) {
   console.log(dto);
   return this.paymentService.uploadPaymentImage(dto);
   }

 @Put('verify_payment')
 async verifyPayment(@Body() dto : any) {
   console.log(dto);
   return this.paymentService.verifyPayment(dto);
   }
}
