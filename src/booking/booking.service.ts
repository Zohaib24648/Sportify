//booking.service.ts
import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { BOOKING_STATUS, PAYMENT_METHOD, PAYMENT_STATUS, Prisma } from '@prisma/client';
import { SlotService } from 'src/slot/slot.service';
import { CourtService } from 'src/court/court.service';
import { CreateBookingDto } from './dto/createbooking.dto';
import { SlotDto } from 'src/slot/dto/slot.dto';
import { UpdateBookingDto } from './dto/updatebooking.dto';
import { BookingFiltersDto } from './dto/bookingfilter.dto';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { PaginationDto } from './dto/pagination.dto';
import { MailService } from 'src/mail/mail.service';

dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);

// Set default time zone to Pakistan Standard Time
dayjs.tz.setDefault('Asia/Karachi');





@Injectable()
export class BookingService {
    constructor(private readonly prisma: PrismaService, private readonly courtService: CourtService,private readonly slotService: SlotService,private readonly mailService: MailService) {}

    

    async calculateTotalAmount(dto: SlotDto): Promise<number> {
      const { court_id, start_time, end_time } = dto;
      const court = await this.courtService.get_court_details(court_id);
      
      const startTime = dayjs.tz(start_time, 'Asia/Karachi');
      const endTime = dayjs.tz(end_time, 'Asia/Karachi');
      
      const durationInHours = endTime.diff(startTime, 'hour', true);
      const totalAmount = durationInHours * court.hourly_rate;
    
      return totalAmount;
    }
    
    

    async createBooking(dto : CreateBookingDto) {
      if (!this.slotService.timevalidator(dto)) {
        throw new BadRequestException('Invalid time slot');
      }
    try {
      const { user_id, court_id, start_time, end_time } = dto;
        const slotdto : SlotDto = {court_id, start_time, end_time};
      
       return this.prisma.$transaction(async (prisma) => {
        const slot = await this.slotService.createSlot(slotdto);
        const totalAmount = await this.calculateTotalAmount(slotdto);
      
       const booking_details = await this.prisma.booking.create({
          data: {
            user_id,
            slot_id: slot.id,
            total_amount: totalAmount,
            paid_amount: 0,
            status: 'pending',
            created_at: new Date(),
            updated_at: new Date(),
          },
        });
        const email = await this.prisma.user.findUnique({
          where: { id: user_id },
          select: { email: true },
        });
        await this.mailService.sendEmail(email.email, 'Booking Confirmation', 'Your booking has been confirmed');
        return booking_details;
      });
    } catch (error) {
      throw new InternalServerErrorException('Error creating booking', error.message);
    }
      
    }

    async updateBooking(dto: UpdateBookingDto) {
      if (!this.slotService.timevalidator(dto)) {
        throw new BadRequestException('Invalid time slot');
      }
      try {
        const { booking_id, start_time, end_time } = dto;
    
        const booking = await this.getBookingDetails(booking_id);
        const court_id = booking.slot.court_id;
    
        // Optionally, validate booking status before updating
        if (booking.status !== BOOKING_STATUS.pending && booking.status !== BOOKING_STATUS.confirmed) {
          throw new BadRequestException('Cannot update booking in its current status');
        }
    
        const slotdto: SlotDto = { court_id, start_time, end_time };
        const total_amount = await this.calculateTotalAmount(slotdto);
    
        // Properly await and return the transaction
        return await this.prisma.$transaction(async (prisma) => {
          // Pass the transaction Prisma client to SlotService methods
          await this.slotService.updateSlot(booking.slot.id, slotdto);
          const updated_booking = await prisma.booking.update({
            where: { id: booking_id },
            data: { total_amount, updated_at: new Date() },
          });
    
          return updated_booking;
        });
      } catch (error) {
        throw new InternalServerErrorException('Error updating booking', error.message);
      }
    }
        
      
    
    
    // Multiple Functions Required
   async  get_all_Bookings(dto:PaginationDto) {
    const { page = 1, limit = 10 } = dto;
    const skip = (page - 1) * limit;

  
        try {
          const bookings = await this.prisma.booking.findMany(
            {
              skip,
              take: limit,
                include: {
                    slot: true,
                    user: true,
                    payment: true
                
                }
            
            }
        );
        return bookings;
        } catch (error) {
          throw new InternalServerErrorException('Failed to fetch bookings', error.message);
        }
    }

    
async getBookingDetails(id: string) {
  if (!id) {
    throw new NotFoundException('Booking ID is required');
  }

  try {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        slot: {
          include: {
            court: true
          },
        },
        user: true,
        payment: true,
      },
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    return booking;
  } catch (error) {
    throw new InternalServerErrorException('Failed to fetch booking details', error.message);
    }
}


    
      

    async cancelBooking(id: string) {
        try {
          const booking = await this.prisma.booking.findUnique({
            where: { id },
            include: { slot: true },
          });
        
          if (!booking) {
            throw new NotFoundException('Booking not found');
          }
        
          return this.prisma.$transaction(async (prisma) => {
            const updatedBooking = await prisma.booking.update({
              where: { id },
              data: {
                status: 'cancelled',
                slot_id: null,
                updated_at: new Date(),
              },
            });
              
            await prisma.slot.delete({
                where: { id: booking.slot.id },
              });
        
            const payments = await prisma.payment.findMany({
              where: { booking_id: id },
            });
        
            for (const payment of payments) {
              const statusUpdate = payment.payment_status === 'paid'
                ? 'refund_pending'
                : 'refunded';
        
              await prisma.payment.update({
                where: { id: payment.id },
                data: { payment_status: statusUpdate },
              });
            }
        
            return updatedBooking;
          });
        } catch (error) {
          
          throw new InternalServerErrorException('Failed to cancel booking', error.message);
        }
      }



    // booking.service.ts
    async getBookingsWithFilters(filters: BookingFiltersDto) {
      try {
        const { start_time, end_time, status, searchTerm } = filters;
        console.log(filters);
    
        // Build the where clause
        const where: Prisma.BookingWhereInput = {};
        //Working
        // Status filter
        if (status) {
          where.status = status as BOOKING_STATUS;
        }
//Working
// Date range filter
if (start_time || end_time) {
  where.slot = where.slot || {};

  const filterStartTime = start_time 
    ? dayjs.tz(start_time, 'Asia/Karachi').format('YYYY-MM-DDTHH:mm:ss')
    : undefined;

  const filterEndTime = end_time
    ? dayjs.tz(end_time, 'Asia/Karachi').format('YYYY-MM-DDTHH:mm:ss')
    : undefined;

  where.slot.start_time = {
    ...(filterStartTime && { gte: filterStartTime }),
    ...(filterEndTime && { lte: filterEndTime })
  };
}
        // Search term filter
        if (searchTerm) {
          where.OR = [
            { id: { contains: searchTerm, mode: 'insensitive' } },
            { user: { name: { contains: searchTerm, mode: 'insensitive' } } },
            { slot: { court: { name: { contains: searchTerm, mode: 'insensitive' } } } }
          ];
        }
    
        // Execute query
        return await this.prisma.booking.findMany({
          where,
          include: {
            slot: {
              include: {
                court: {
                  include: {
                    court_specs: true,
                    game_types: {
                      include: {
                        game_type: true
                      }
                    }
                  }
                }
              }
            },
            user: true,
            payment: true
          },
          orderBy: {
            created_at: 'desc'
          }
        });
      } catch (error) {
        throw new BadRequestException('Failed to fetch bookings', error.message);
      }
    } 
  
  }
