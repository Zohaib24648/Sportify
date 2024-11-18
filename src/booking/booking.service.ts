//booking.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Booking_Status, PAYMENT_METHOD, Payment_Status, Prisma } from '@prisma/client';
import { SlotService } from 'src/slot/slot.service';
import { CourtService } from 'src/court/court.service';


@Injectable()
export class BookingService {
    constructor(private readonly prisma: PrismaService, private readonly courtService: CourtService,private readonly slotService: SlotService) {}

    

    async createBooking(dto: any) {
        const { user_id, court_id, start_time, end_time } = dto;
    
        // Step 1: Use Prisma transaction for atomicity
        return await this.prisma.$transaction(async (prisma) => {
            // Step 2: Create a slot
            const slot = await this.slotService.createSlot({
               
                    court_id,
                    start_time: start_time,
                    end_time: end_time,
            });
    
            // Step 3: Fetch court details (including hourly rate)
            const court = await this.courtService.get_court_details(court_id);
            if (!court) {
                throw new Error('Court not found');
            }    
            // Step 4: Calculate booking duration in half-hours
            const bookingDurationInMilliseconds =
                new Date(end_time).getTime() - new Date(start_time).getTime();
            const  bookingDurationInHalfHours = Math.ceil(
                bookingDurationInMilliseconds / (1000 * 60 * 30) // 30 minutes = 1800 seconds
            );
    
            // Step 5: Calculate total amount (based on half-hours)
            const total_amount = (bookingDurationInHalfHours / 2) * court.hourly_rate;
            const paid_amount = 0; // Default paid amount is 0
    
            // Step 6: Create a booking
            const booking = await prisma.booking.create({
                data: {
                    user_id,
                    slot_id: slot.id,
                    status: 'pending',
                    total_amount,
                    paid_amount,
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
   async  get_all_Bookings(dto:any) {
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
        console.log(id);
    
        const result = await this.prisma.$transaction(async (prisma) => {
            // Step 1: Update booking status and set slot_id to null
            const booking = await prisma.booking.update({
                where: { id: id },
                data: {
                    status: 'cancelled' as Booking_Status,
                    slot_id: null,
                    Updated_at: new Date(),
                },
                include: {
                    slot: {
                        include: {
                            court: true,
                        },
                    },
                },
            });
    
            const court_id = booking.slot?.court.id;
    
            console.log(booking);
    
            // Step 2: Delete slots associated with the court
            const deleted_slot = await prisma.slot.deleteMany({
                where: {
                    court_id: court_id,
                },
            });
    
            console.log(deleted_slot);
    
            // Step 3: Update payments associated with the booking
            const payments = await prisma.payment.updateMany({
                where: {
                    booking_id: id,
                    payment_status: 'paid' as Payment_Status,
                },
                data: {
                    payment_status: 'refund_pending' as Payment_Status,
                },
            });
    
            console.log(payments);
    
            return { booking, deleted_slot, payments };
        });
    
        return result;
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
