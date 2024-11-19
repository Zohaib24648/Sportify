//booking.service.ts
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Booking_Status, PAYMENT_METHOD, Payment_Status, Prisma } from '@prisma/client';
import { SlotService } from 'src/slot/slot.service';
import { CourtService } from 'src/court/court.service';
import { CreateBookingDto } from './dto/createbooking.dto';


@Injectable()
export class BookingService {
    constructor(private readonly prisma: PrismaService, private readonly courtService: CourtService,private readonly slotService: SlotService) {}

    

    async createBooking(dto: CreateBookingDto) {
        const { user_id, court_id, start_time, end_time } = dto;
    
        const court = await this.courtService.get_court_details(court_id);
  
        if (!court) {
    throw new NotFoundException('Court not found');
  }

  const bookingDurationInMilliseconds =
    new Date(end_time).getTime() - new Date(start_time).getTime();

  if (bookingDurationInMilliseconds <= 0) {
    throw new BadRequestException('Invalid booking duration');
  }

  return this.prisma.$transaction(async (prisma) => {
    // Slot creation
    const slot = await this.slotService.createSlot({
      court_id,
      start_time,
      end_time,
    });

    const bookingDurationInHalfHours = Math.ceil(
      bookingDurationInMilliseconds / (1000 * 60 * 30)
    );

    const total_amount = (bookingDurationInHalfHours / 2) * court.hourly_rate;

    const booking = await prisma.booking.create({
      data: {
        user_id,
        slot_id: slot.id,
        status: 'pending',
        total_amount,
        paid_amount: 0,
        Created_at: new Date(),
        Updated_at: new Date(),
      },
    });
    
            // Step 7: Return the created booking and slot
            return {
                booking,
                slot,
            };
        });
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
        const booking =  await this.prisma.booking.findUnique({ 
            where: { id },
            include: {
                slot: true,
                user: true,
                Payment: true
            }
        });
        return booking;
    }


    updateBooking(id: any, dto: any) {
        const booking = this.prisma.booking.update({ where: { id }, data: dto });
        return booking;
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
      
          if (booking.slot) {
            await prisma.slot.delete({
              where: { id: booking.slot.id },
            });
          }
      
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




    
}
