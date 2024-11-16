import { Controller, UseGuards } from '@nestjs/common';
import { Delete, Get, Module, Post, Put,Body,Param } from '@nestjs/common';
import { BookingService } from './booking.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/guard/roles.decorator';

@Controller('booking')
export class BookingController {
    constructor(private bookingService: BookingService) {}

  //Create Booking
  @UseGuards(AuthGuard('jwt'))
  @Post('create_booking')
  async createBooking(@Body() booking: any) {
    return this.bookingService.createBooking(booking);
    }

  //Get Bookings
  @Roles('admin')
  @UseGuards(AuthGuard('jwt'),RolesGuard)
  @Get('get_all_bookings')
  async getBookings(@Body() dto: any) {
    return this.bookingService.get_all_Bookings( dto);
  }

  //Update Booking
  @Put('update_booking/:id')
  async updateBooking(@Param('id') id: string, @Body() booking: any) {
    return this.bookingService.updateBooking(id, booking);
  }

  //Delete Booking
  @Delete('delete_booking/:id')
  async deleteBooking(@Param('id') id: string) {
    return this.bookingService.deleteBooking(id);
    }

  //Get Booking Details
  @Get('get_booking_details/:id')
  async getBookingDetails(@Param('id') id: string) {
    return this.bookingService.getBookingDetails(id);
    }

//   //Create Payment
//   @Post('create_payment')
//   async createPayment(@Body() payment: any) {
//     return this.bookingService.createPayment(payment);
//     }

  //Get Payments
  @Get('get_payments')
  async getPayments() {
    return this.bookingService.getPayments();
    }

  //Get Payment By Id
  @Get('get_payment_by_id/:id')
  async getPaymentById(@Param('id') id: string) {
    return this.bookingService.getPaymentById(id);
    }

  //Update Payment
  @Put('update_payment/:id')
  async updatePayment(@Param('id') id: string, @Body() payment: any) {
    return this.bookingService.updatePayment(id, payment);
    }

  //Delete Payment
  @Delete('delete_payment/:id')
  async deletePayment(@Param('id') id: string) {
    return this.bookingService.deletePayment(id);
    }

}
