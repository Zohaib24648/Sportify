//paymernt service
import { Injectable } from '@nestjs/common';
import { PAYMENT_METHOD, Payment_Status } from '@prisma/client';
import { CourtService } from 'src/court/court.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PaymentService {

    constructor(private readonly prisma: PrismaService, private readonly courtService: CourtService ) {}

    
    async createPayment(booking_id: string, payment_amount: number, payment_method: string) {
        console.log(booking_id, payment_amount, payment_method);
    
        // Step 1: Fetch booking details with related slot and court information
        const bookingDetails = await this.prisma.booking.findFirst({
            where: { id: booking_id , 
                slot_id: {
                not: null}, 
            },
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
        const { min_down_payment } = slot.court;
    
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
        const threshold_amount = (min_down_payment * total_amount)/ 100;
    
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

    getpendingPayments() {
        const payments = this.prisma.payment.findMany({ where: { payment_status: 'verification_pending' } });
        return payments;
    }

    getPaymetByStatus(status: string) {
        const payments = this.prisma.payment.findMany({ where: { payment_status: status as Payment_Status } });
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
        const { payment_amount, payment_method } = dto;
        const payment = this.prisma.payment.update({ where: { id }, data: { payment_amount, payment_method } });
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
