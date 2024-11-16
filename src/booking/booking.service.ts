import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CourtService } from 'src/court/court.service';



@Injectable()
export class BookingService {
    constructor(private readonly prisma: PrismaService, private readonly courtService: CourtService ) {}

    async createSlot(dto: any) {
        const { court_id, start_time, end_time } = dto;
    
        // Convert times to Date objects
        const startTime = new Date(start_time);
        const endTime = new Date(end_time);
    
        // Step 1: Check for overlapping slots
        const overlappingSlot = await this.prisma.slot.findFirst({
            where: {
                court_id,
                OR: [
                    {
                        Start_time: {
                            lt: endTime, // Existing slot starts before or during the new slot's end
                        },
                        End_time: {
                            gt: startTime, // Existing slot ends after or during the new slot's start
                        },
                    },
                ],
            },
        });
    
        if (overlappingSlot) {
            throw new Error(
                `Slot overlap detected for court ${court_id} between ${start_time} and ${end_time}`
            );
        }
    
        // Step 2: Create the slot if no overlap is found
        const slot = await this.prisma.slot.create({
            data: {
                court_id,
                Start_time: startTime,
                End_time: endTime,
            },
        });
    
        return slot;
    }
    


    getSlots() {
        throw new Error('Method not implemented.');
    }

    getSlotById(id: any) {
        throw new Error('Method not implemented.');
    }

    updateSlot(id: any, dto: any) {
        throw new Error('Method not implemented.');
    }

    deleteSlot(id: any) {
        throw new Error('Method not implemented.');
    }

    async createBooking(dto: any) {
        const { user_id, court_id, start_time, end_time } = dto;
    
        // Step 1: Use Prisma transaction for atomicity
        return await this.prisma.$transaction(async (prisma) => {
            // Step 2: Create a slot
            const slot = await this.createSlot({
               
                    court_id,
                    start_time: start_time,
                    end_time: end_time,
            });
    
            // Step 3: Fetch court details (including hourly rate)
            const court = await this.courtService.get_court_details(court_id);
            if (!court) {
                throw new Error('Court not found');
            }
            const court_hourly_rate = court.hourly_rate;
    
            // Step 4: Calculate booking duration in half-hours
            const bookingDurationInMilliseconds =
                new Date(end_time).getTime() - new Date(start_time).getTime();
            const bookingDurationInHalfHours = Math.ceil(
                bookingDurationInMilliseconds / (1000 * 60 * 30) // 30 minutes = 1800 seconds
            );
    
            // Step 5: Calculate total amount (based on half-hours)
            const total_amount = (bookingDurationInHalfHours / 2) * court_hourly_rate;
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
    get_all_Bookings(dto:any) {
        const bookings = this.prisma.booking.findMany(
            {
                include: {
                    slot: true,
                    user: true,
                    Payment: true}
            
            }
        );
        return bookings;
    }

    getBookingDetails(id: any) {
        throw new Error('Method not implemented.');
    }

    updateBooking(id: any, dto: any) {
        throw new Error('Method not implemented.');
    }

    deleteBooking(id: any) {
        throw new Error('Method not implemented.');
    }

    //  async createPayment(booking_id: string , payment_amount: number, payment_method: string) {
    //     // Step 1: Fetch booking details
    //     const booking = await this.prisma.booking.findUnique({
    //         where: {
    //             id: booking_id
    //         }
    //     });
    //     if (!booking) {
    //         throw new Error('Booking not found');
    //     }

    //     // Step 2: Calculate the remaining amount
    //     const remaining_amount = booking.total_amount - booking.paid_amount;
    //     if (remaining_amount <= 0) {
    //         throw new Error('Payment already made');
    //         }
    //     // Step 3: Create the payment
    //     const payment = await this.prisma.payment.create({
    //         data: {
    //             booking_id: booking_id,
    //             payment_amount: payment_amount,
    //             payment_method: payment_method
            
    //         }});
    //     return payment;
    // }

    getPayments() {
        throw new Error('Method not implemented.');
    }

    getPaymentById(id: any) {
        throw new Error('Method not implemented.');
    }

    updatePayment(id: any, dto: any) {
        throw new Error('Method not implemented.');
    }

    deletePayment(id: any) {
        throw new Error('Method not implemented.');
    }







}
