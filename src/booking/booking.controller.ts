// booking.controller.ts
import { Controller, Query, UseGuards } from '@nestjs/common';
import { Delete, Get, Post, Put, Body, Param } from '@nestjs/common';
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

@ApiBearerAuth()
@Roles('admin')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiTags('Bookings')
@Controller('booking')
export class BookingController {
  constructor(
    private bookingService: BookingService,
    private paymentservice: PaymentService,
  ) {}

  @ApiOperation({ summary: 'Create a new booking (Admin only)' })
  @ApiResponse({ status: 201, description: 'Booking successfully created.' })
  @ApiResponse({
    status: 400,
    description: 'Invalid time slot or other errors.',
  })
  @Post('create_booking')
  async createBooking(@Body() dto: CreateBookingDto) {
    return this.bookingService.createBooking(dto);
  }

  @ApiOperation({ summary: 'Get all bookings (Admin only)' })
  @ApiResponse({ status: 200, description: 'List of all bookings.' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Admin role required.',
  })
  @Get('get_all_bookings')
  async getBookings(@Query() dto: PaginationDto) {
    return this.bookingService.get_all_Bookings(dto);
  }

  @ApiOperation({ summary: 'Update an existing booking (Admin only)' })
  @ApiResponse({ status: 200, description: 'Booking updated successfully.' })
  @ApiResponse({
    status: 400,
    description: 'Invalid time slot or booking status prevents update.',
  })
  @Put('update_booking/:id')
  async updateBooking(@Body() dto: UpdateBookingDto) {
    return this.bookingService.updateBooking(dto);
  }

  @ApiOperation({ summary: 'Cancel a booking (Admin only)' })
  @ApiResponse({ status: 200, description: 'Booking canceled successfully.' })
  @ApiResponse({ status: 404, description: 'Booking not found.' })
  @Post('cancel_booking/:id')
  async cancelBooking(@Param('id') id: string) {
    return this.bookingService.cancelBooking(id);
  }

  @ApiOperation({
    summary: 'Get details of a specific booking (Admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Booking details fetched successfully.',
  })
  @ApiResponse({ status: 404, description: 'Booking not found.' })
  @Get('get_booking_details/:id')
  async getBookingDetails(@Param('id') id: string) {
    return this.bookingService.getBookingDetails(id);
  }

  @ApiOperation({
    summary: 'Filter bookings based on provided criteria (Admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Filtered bookings returned successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid filter parameters or error in filtering.',
  })
  @Get()
  async filterBookings(@Query() filters: BookingFiltersDto) {
    return this.bookingService.getBookingsWithFilters(filters);
  }
}