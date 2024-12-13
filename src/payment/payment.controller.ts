//payment.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentDto } from './dto/payment.dto';
import { PImageDto } from './dto/p_image.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/guard/roles.decorator';
import { PAYMENT_STATUS } from '@prisma/client';

@ApiTags('Payments')
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @ApiOperation({ summary: 'Create a new payment for a booking' })
  @ApiResponse({ status: 201, description: 'Payment created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiBearerAuth()
  //Create Payment
  @Post('create_payment')
  async createPayment(@Body() dto: PaymentDto) {
    return this.paymentService.createPayment(dto);
  }

  @ApiOperation({ summary: 'Retrieve all payments' })
  @ApiResponse({
    status: 200,
    description: 'List of payments retrieved successfully',
  })
  @ApiBearerAuth()

  //Get Payments
  @Get('get_payments')
  async getPayments() {
    return this.paymentService.getPayments();
  }

  @ApiOperation({ summary: 'Get payments filtered by status' })
  @ApiResponse({
    status: 200,
    description: 'List of payments by status retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'No payments found with the specified status',
  })
  @ApiBearerAuth()
  //Get Payment By Payment Status
  @Get('get_payment_by_status/:status')
  async getPaymentByStatus(@Param('status') status: PAYMENT_STATUS) {
    return this.paymentService.getPaymetByStatus(status);
  }

  //Get Payment By Id
  @ApiOperation({ summary: 'Retrieve payment details by ID' })
  @ApiResponse({ status: 200, description: 'Payment retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  @ApiBearerAuth()
  @Get('get_payment_by_id/:id')
  async getPaymentById(@Param('id') id: string) {
    return this.paymentService.getPaymentById(id);
  }

  @ApiOperation({ summary: 'Update an existing payment' })
  @ApiResponse({ status: 200, description: 'Payment updated successfully' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  @ApiResponse({ status: 400, description: 'Invalid payment amount' })
  @ApiBearerAuth()
  //Update Payment
  @Put('update_payment/:id')
  async updatePayment(@Param('id') id: string, @Body() payment: PaymentDto) {
    return this.paymentService.updatePayment(id, payment);
  }

  @ApiOperation({ summary: 'Upload a payment receipt (image)' })
  @ApiResponse({
    status: 200,
    description: 'Payment image uploaded successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid booking ID or image' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('user')
  @Post('upload_payment_receipt')
  @UseInterceptors(FileInterceptor('payment_image'))
  async uploadPaymentReceipt(@Req() req:any, @Body() paymentId :PImageDto , @UploadedFile() image: Express.Multer.File) {
    const token = req.user;
    console.log(token);
    return this.paymentService.uploadPaymentImage(token,image,paymentId,);
  }

  @ApiOperation({ summary: 'Verify a payment by ID' })
  @ApiResponse({ status: 200, description: 'Payment verified successfully' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  @ApiBearerAuth()
  @Put('verify_payment/:id')
  async verifyPayment(@Param('id') id: string) {
    console.log(id);
    return this.paymentService.verifyPayment(id);
  }
}
