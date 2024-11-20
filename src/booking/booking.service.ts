//booking.service.ts
import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Booking_Status, PAYMENT_METHOD, Payment_Status, Prisma } from '@prisma/client';
import { SlotService } from 'src/slot/slot.service';
import { CourtService } from 'src/court/court.service';
import { CreateBookingDto } from './dto/createbooking.dto';
import { SlotDto } from 'src/slot/dto/slot.dto';
import { UpdateBookingDto } from './dto/updatebooking.dto';
import { BookingFiltersDto } from './dto/bookingfilter.dto';


@Injectable()
export class BookingService {
    constructor(private readonly prisma: PrismaService, private readonly courtService: CourtService,private readonly slotService: SlotService) {}

    

    async calculateTotalAmount(dto:SlotDto){
        const {court_id, start_time, end_time} = dto;
        const court = await this.courtService.get_court_details(court_id);
        const durationInHours = (new Date(end_time).getTime() - new Date(start_time).getTime()) / (1000 * 60 * 60);
        const totalAmount = durationInHours * court.hourly_rate;
        return totalAmount;
    }


    async createBooking(dto : CreateBookingDto) {
        const { user_id, court_id, start_time, end_time } = dto;
        const slotdto : SlotDto = {court_id, start_time, end_time};

        const slot = await this.slotService.createSlot(slotdto);
        const totalAmount = await this.calculateTotalAmount(slotdto);
      
        return await this.prisma.booking.create({
          data: {
            user_id,
            slot_id: slot.id,
            total_amount: totalAmount,
            paid_amount: 0,
            status: 'pending',
            Created_at: new Date(),
            Updated_at: new Date(),
          },
        });
      }

      async updateBooking(dto : UpdateBookingDto) {
        const { booking_id, start_time, end_time } = dto;
        
        const booking = await this.getBookingDetails(booking_id);        
        const court_id = booking.slot.court_id;

        const slotdto : SlotDto  = {court_id , start_time, end_time};
        const total_amount = await this.calculateTotalAmount(slotdto);
        await this.slotService.updateSlot(booking.slot.id, slotdto );
      
        const updated_booking = await this.prisma.booking.update({
          where: { id: booking_id },
          data: {total_amount, Updated_at: new Date() },
        });
        
        return updated_booking;
      }
      
    
    
    // Multiple Functions Required
   async  get_all_Bookings() {
        const bookings = await this.prisma.booking.findMany(
            {
                include: {
                    slot: true,
                    user: true,
                    Payment: true
                
                }
            
            }
        );
        return bookings;
    }

    
async getBookingDetails(id: string) {
  if (!id) {
    throw new NotFoundException('Booking ID is required');
  }

  try {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        slot: true,
        user: true,
        Payment: true,
      },
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    return booking;
  } catch (error) {
    console.error('Error fetching booking details:', error.message);

    // Handle known Prisma client errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      throw new InternalServerErrorException('Database error occurred while fetching booking details');
    }

    // Throw a generic error for any other issues
    throw new InternalServerErrorException('Failed to fetch booking details');
    }
}


    
      

    async cancelBooking(id: string) {
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
              Updated_at: new Date(),
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
      }
      
    
    
    
    async getBookingsByUserId(user_id: string) {
        const bookings = await this.prisma.booking.findMany({
            where: {
                user_id,
            },
            include: {
                slot: true,
                Payment: true
            },
        });
    
        return bookings;
    }



    async getBookingsWithFilters(filters: BookingFiltersDto) {
        const { start_time, end_time, status, gameTypes, courtTypes, searchTerm } = filters;
      
        const where: Prisma.BookingWhereInput = {};
      
        // Filter by booking status
        if (status) {
          where.status = status as Booking_Status;
        }
      
        // Filter by date range
        if (start_time || end_time) {
          where.slot = {
            start_time: {
              ...(start_time && { gte: new Date(start_time) }),
              ...(end_time && { lte: new Date(end_time) }),
            },
          } as Prisma.SlotWhereInput;
        }
      
        // Filter by game types
        if (gameTypes) {
          where.slot = where.slot || {};
          where.slot.court = {
            game_types: {
              some: {
                game_type: {
                  name: gameTypes,
                },
              },
            },
          } as Prisma.CourtWhereInput;
        }
      
        // Filter by court types
        if (courtTypes && courtTypes.length > 0) {
          where.slot = where.slot || {};
          where.slot.court = {
            ...where.slot.court,
            court_specs: {
              some: {
                name: {
                  in: courtTypes,
                },
              },
            },
          } as Prisma.CourtWhereInput;
        }
      
        // Search functionality within bookings
        if (searchTerm) {
          where.OR = [
            { id: { contains: searchTerm, mode: 'insensitive' } },
            {
              user: {
                name: { contains: searchTerm, mode: 'insensitive' },
              },
            },
            {
              slot: {
                court: {
                  name: { contains: searchTerm, mode: 'insensitive' },
                },
              },
            },
          ];
        }
      
        console.log('Where clause:', where);
      
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
                    },
                }
              },
            },
            user: true,
            Payment: true,
          },
        });
      }
      

async searchBookings(searchTerm: string) {
    const bookings = await this.prisma.booking.findMany({
      where: {
        OR: [
          { id: { contains: searchTerm, mode: 'insensitive' } },
          {
            user: {
              name: { contains: searchTerm, mode: 'insensitive' },
            },
          },
          {
            slot: {
              court: {
                name: { contains: searchTerm, mode: 'insensitive' },
              },
            },
          },
        ],
      },
      include: {
        slot: {
          include: {
            court: true,
          },
        },
        user: true,
        Payment: true,
      },
    });

    if (bookings.length === 0) {
        throw new NotFoundException('No bookings found matching the criteria');
      }
  
    return bookings;
  }
}