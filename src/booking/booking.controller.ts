//booking.controller.ts
import { Controller, Query, UseGuards } from '@nestjs/common';
import { Delete, Get, Module, Post, Put, Body, Param } from '@nestjs/common';
import { BookingService } from './booking.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/guard/roles.decorator';
import { PaymentService } from 'src/payment/payment.service';
import { CreateBookingDto } from './dto/createbooking.dto';
import { UpdateBookingDto } from './dto/updatebooking.dto';
import { BookingFiltersDto } from './dto/bookingfilter.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PaginationDto } from './dto/pagination.dto';

@ApiTags('Bookings')
@Controller('booking')
export class BookingController {
  constructor(
    private bookingService: BookingService,
    private paymentservice: PaymentService,
  ) {}

  //Create Booking
  @ApiOperation({ summary: 'Create a new booking' })
  @ApiResponse({ status: 201, description: 'Booking successfully created.' })
  @ApiResponse({
    status: 400,
    description: 'Invalid time slot or other errors.',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post('create_booking')
  async createBooking( @Body() dto: CreateBookingDto) {
    return this.bookingService.createBooking(dto);
  }

  @ApiOperation({ summary: 'Get all bookings (Admin only)' })
  @ApiResponse({ status: 200, description: 'List of all bookings.' })
  @ApiResponse({ status: 403, description: 'Forbidden. Admin role required.' })
  @ApiBearerAuth()
  //Get Bookings
  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get('get_all_bookings')
  async getBookings(@Query() dto: PaginationDto) {
    return this.bookingService.get_all_Bookings(dto);
  }

  @ApiOperation({ summary: 'Update an existing booking' })
  @ApiResponse({ status: 200, description: 'Booking updated successfully.' })
  @ApiResponse({
    status: 400,
    description: 'Invalid time slot or booking status prevents update.',
  })
  @ApiBearerAuth()
  //Update Booking
  @Put('update_booking/:id')
  async updateBooking(@Body() dto: UpdateBookingDto) {
    return this.bookingService.updateBooking(dto);
  }

  @ApiOperation({ summary: 'Cancel a booking' })
  @ApiResponse({ status: 200, description: 'Booking canceled successfully.' })
  @ApiResponse({ status: 404, description: 'Booking not found.' })
  @ApiBearerAuth()
  //Delete Booking
  @Post('cancel_booking/:id')
  async cancelBooking(@Param('id') id: string) {
    return this.bookingService.cancelBooking(id);
  }

  @ApiOperation({ summary: 'Get details of a specific booking' })
  @ApiResponse({
    status: 200,
    description: 'Booking details fetched successfully.',
  })
  @ApiResponse({ status: 404, description: 'Booking not found.' })
  @ApiBearerAuth()
  //Get Booking Details
  @Get('get_booking_details/:id')
  async getBookingDetails(@Param('id') id: string) {
    return this.bookingService.getBookingDetails(id);
  }

  @ApiOperation({ summary: 'Filter bookings based on provided criteria' })
  @ApiResponse({
    status: 200,
    description: 'Filtered bookings returned successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid filter parameters or error in filtering.',
  })
  @ApiBearerAuth()
  @Get()
  async filterBookings(@Query() filters: BookingFiltersDto) {
    return this.bookingService.getBookingsWithFilters(filters);
  }
}
