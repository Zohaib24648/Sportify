import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PAYMENT_METHOD, Prisma } from '@prisma/client';
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
                    Payment: true
                
                }
            
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

    async createPayment(booking_id: string, payment_amount: number, payment_method: string) {
        console.log(booking_id, payment_amount, payment_method);
    
        // Step 1: Fetch booking details with related slot and court information
        const bookingDetails = await this.prisma.booking.findUnique({
            where: { id: booking_id },
            include: {
                slot: {
                    include: {
                        court: true,
                    },
                },
            },
        });
    
        console.log(bookingDetails);
    
        if (!bookingDetails) {
            throw new Error('Booking not found');
        }
    
        const { total_amount, paid_amount, slot } = bookingDetails;
        const { min_down_payment, hourly_rate } = slot.court;
    
        // Step 2: Check for pending payments for this booking
        const pendingPayments = await this.prisma.payment.findFirst({
            where: {
                booking_id: booking_id,
                payment_status: 'not_paid', // Check if there's an unpaid payment
            },
        });
    
        if (pendingPayments) {
            throw new Error(
                `A payment is already pending for this booking. Complete or verify the previous payment first.`
            );
        }
    
        // Step 3: Calculate remaining amount and threshold amount
        const remaining_amount = total_amount - paid_amount;
        const threshold_amount = (min_down_payment * total_amount) / 100;
    
        if (paid_amount >= total_amount) {
            throw new Error('Payment already completed');
        }
    
        // Step 4: Determine if it's the first payment or subsequent payments
        if (remaining_amount === total_amount) {
            // First payment: Ensure payment meets the minimum threshold
            if (payment_amount < threshold_amount) {
                throw new Error(
                    `First payment must be at least the threshold amount: ${threshold_amount}`
                );
            }
        } else {
            // Subsequent payments: Ensure payment does not exceed remaining amount
            if (payment_amount > remaining_amount) {
                throw new Error(
                    `Payment exceeds the remaining amount. Remaining amount: ${remaining_amount}`
                );
            }
        }
    
        // Step 5: Create the payment record
        const payment = await this.prisma.payment.create({
            data: {
                booking_id: booking_id,
                payment_amount: payment_amount,
                payment_status: 'not_paid',
                payment_method: payment_method as PAYMENT_METHOD,
                payment_image_link: '', // Add image link if available
            },
        });
    
        console.log('Payment created:', payment);
        return payment;
    }
    

    getPayments() {
        const payments = this.prisma.payment.findMany();
        return payments;
    }

        getPaymentById(id: any) {
        const payment = this.prisma.payment.findUnique({ where: { id } });
        }




        async uploadPaymentImage(dto: any) {
            const { id, payment_image_link } = dto;
            console.log(id, payment_image_link);
            // Validate inputs
            if (!id || !payment_image_link) {
                throw new Error('Payment ID and image link are required');
            }
        
            // Update the payment record
            const payment = await this.prisma.payment.update({
                where: { id }, // Match the primary key
                data: { 
                    payment_image_link, 
                    payment_status: 'verification_pending' // Update the status
                },
            });
        
            console.log('Payment updated successfully:', payment);
            return payment;
        }
        


    updatePayment(id: any, dto: any) {
        throw new Error('Method not implemented.');
    }


    async verifyPayment(dto: { id: string }) {
        const { id } = dto;
    
        // Step 1: Fetch the payment to check its current status
        const payment = await this.prisma.payment.findUnique({
            where: { id },
        });
    
        if (!payment) {
            throw new Error('Payment not found');
        }
    
        if (payment.payment_status === 'paid') {
            throw new Error('This payment has already been verified');
        }
    
        // Step 2: Update payment status to 'paid'
        const updatedPayment = await this.prisma.payment.update({
            where: { id },
            data: { payment_status: 'paid' },
        });
    
        console.log('Payment verified:', updatedPayment);
    
        // Step 3: Fetch and update booking details
        const booking = await this.prisma.booking.update({
            where: { id: updatedPayment.booking_id },
            data: {
                paid_amount: { increment: updatedPayment.payment_amount },
            },
            include: {
                slot: {
                    include: {
                        court: true,
                    },
                },
            },
        });
    
        // Step 4: Determine booking status based on paid amount
        const { total_amount, paid_amount, status, slot } = booking;
        const min_down_payment = (slot.court.min_down_payment * total_amount) / 100;
    
        let updatedStatus = null;
    
        if (paid_amount >= total_amount && status !== 'completed') {
            updatedStatus = 'completed'; // Fully paid
        } else if (paid_amount >= min_down_payment && paid_amount < total_amount && status !== 'confirmed') {
            updatedStatus = 'confirmed'; // Partially paid beyond threshold
        }
    
        // Step 5: Update status if necessary
        if (updatedStatus) {
            await this.prisma.booking.update({
                where: { id: updatedPayment.booking_id },
                data: { status: updatedStatus },
            });
            booking.status = updatedStatus; // Update in-memory object
        }
    
        return { payment: updatedPayment, booking };
    }

    
    deletePayment(id: any) {
        throw new Error('Method not implemented.');
    }







}
