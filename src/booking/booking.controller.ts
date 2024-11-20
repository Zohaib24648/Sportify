//booking.controller.ts
import { Controller, Query, UseGuards } from '@nestjs/common';
import { Delete, Get, Module, Post, Put,Body,Param } from '@nestjs/common';
import { BookingService } from './booking.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/guard/roles.decorator';
import { PaymentService } from 'src/payment/payment.service';
import { CreateBookingDto } from './dto/createbooking.dto';
import { UpdateBookingDto } from './dto/updatebooking.dto';
import { BookingFiltersDto } from './dto/bookingfilter.dto';

@Controller('booking')
export class BookingController {
    constructor(private bookingService: BookingService, private paymentservice: PaymentService) {}

  //Create Booking
  @UseGuards(AuthGuard('jwt'))
  @Post('create_booking')
  async createBooking(@Body() dto: CreateBookingDto) {
    return this.bookingService.createBooking(dto);
    }

  // //Get Bookings
  // @Roles('admin')
  // @UseGuards(AuthGuard('jwt'),RolesGuard)
  // @Get('get_all_bookings')
  // async getBookings() {
  //   return this.bookingService.get_all_Bookings( );
  // }

  //Update Booking
  @Put('update_booking/:id')
  async updateBooking(@Body() dto: UpdateBookingDto) {
    return this.bookingService.updateBooking(dto);
  }

  //Delete Booking
  @Post('cancel_booking/:id')
  async cancelBooking(@Param('id') id: string) {
    return this.bookingService.cancelBooking(id);
  }

  //Get Booking Details
  @Get('get_booking_details/:id')
  async getBookingDetails(@Param('id') id: string) {
    return this.bookingService.getBookingDetails(id);
    }

  //Get Bookings by User
  @Get('get_bookings_by_user/:id')
  async getBookingsByUser(@Param('id') id: string) {
    return this.bookingService.getBookingsByUserId(id);
    }


  @Get()
  async getBookings(@Query() filters: BookingFiltersDto) {
    return this.bookingService.getBookingsWithFilters(filters);
  }
}
