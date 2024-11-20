//paymernt service
import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PAYMENT_METHOD, Payment_Status, Prisma } from '@prisma/client';
import { CourtService } from 'src/court/court.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaymentDto } from './dto/payment.dto';
import { PImageDto } from './dto/p_image.dto';

@Injectable()
export class PaymentService {

    constructor(private readonly prisma: PrismaService, private readonly courtService: CourtService ) {}

    
async createPayment(dto: PaymentDto) {
    const { booking_id, payment_amount, payment_method } = dto;
  try {
    // Fetch booking details with slot and court information
    const bookingDetails = await this.prisma.booking.findFirst({
      where: {
        id: booking_id,
        slot_id: { not: null },
      },
      include: {
        slot: {
          include: { court: true },
        },
      },
    });

    if (!bookingDetails) {
      throw new NotFoundException('Booking not found');
    }

    const { total_amount, paid_amount, slot } = bookingDetails;
    const { min_down_payment } = slot.court;

    // Check for pending payments
    const pendingPayments = await this.prisma.payment.findFirst({
      where: {
        booking_id,
        payment_status: 'not_paid',
      },
    });

    if (pendingPayments) {
      throw new ConflictException('A payment is already pending for this booking');
    }

    // Calculate remaining and threshold amounts
    const remainingAmount = total_amount - paid_amount;
    const thresholdAmount = (min_down_payment * total_amount) / 100;

    if (paid_amount >= total_amount) {
      throw new BadRequestException('Payment already completed');
    }

    if (remainingAmount === total_amount && payment_amount < thresholdAmount) {
      throw new BadRequestException(
        `First payment must meet the minimum threshold: ${thresholdAmount}`
      );
    }

    if (payment_amount > remainingAmount) {
      throw new BadRequestException(
        `Payment exceeds the remaining amount: ${remainingAmount}`
      );
    }

    // Create the payment record
    return await this.prisma.payment.create({
      data: {
        booking_id,
        payment_amount,
        payment_status: 'not_paid',
        payment_method: payment_method as PAYMENT_METHOD,
        payment_image_link: '',
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      throw new InternalServerErrorException('Database error occurred while creating payment');
    }
    throw error;
  }
}
    

async getPayments() {
    try {
      return await this.prisma.payment.findMany();
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch payments');
    }
  }
  

    getpendingPayments() {
        const payments = this.prisma.payment.findMany({ where: { payment_status: 'verification_pending' } });
        return payments;
    }

    getPaymetByStatus(status: string) {
        const payments = this.prisma.payment.findMany({ where: { payment_status: status as Payment_Status } });
        return payments;
    }


        getPaymentById(id: string) {
        const payment = this.prisma.payment.findUnique({ where: { id } });
        }




        async uploadPaymentImage(dto: PImageDto) {
            const { booking_id, image } = dto;
        
            // Update the payment record
            const payment = await this.prisma.payment.update({
                where: { id : booking_id }, // Match the primary key
                data: { 
                    payment_image_link: image, 
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


        async verifyPayment(body: any) {
            const { id } = body;
            console.log('Verifying payment:', body.id);
            if (!body.id) {
              throw new BadRequestException('Payment ID is required');
            }
          
            try {
              return await this.prisma.$transaction(async (prisma) => {
                // Step 1: Fetch the payment and validate its current status
                const payment = await prisma.payment.findFirst({
                  where: { id:body.id },
                });
          
                if (!payment) {
                  throw new NotFoundException(`Payment with ID ${id} not found`);
                }
          
                if (payment.payment_status === 'paid') {
                  throw new ConflictException('This payment has already been verified');
                }
          
                // Step 2: Update payment status to 'paid'
                const updatedPayment = await prisma.payment.update({
                  where: { id},
                  data: { payment_status: 'paid' },
                });
          
                console.log('Payment verified successfully:', updatedPayment);
          
                // Step 3: Fetch and update booking details
                const booking = await prisma.booking.update({
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
          
                if (!booking) {
                  throw new InternalServerErrorException(
                    `Failed to update booking for payment ID ${id}`
                  );
                }
          
                // Step 4: Calculate minimum down payment and determine booking status
                const { total_amount, paid_amount, status, slot } = booking;
                const minDownPayment = (slot.court.min_down_payment * total_amount) / 100;
          
                let updatedStatus = null;
          
                if (paid_amount >= total_amount && status !== 'completed') {
                  updatedStatus = 'completed'; // Fully paid
                } else if (paid_amount >= minDownPayment && status !== 'confirmed') {
                  updatedStatus = 'confirmed'; // Partially paid beyond threshold
                }
          
                // Step 5: Update booking status if necessary
                if (updatedStatus) {
                  await prisma.booking.update({
                    where: { id: booking.id },
                    data: { status: updatedStatus },
                  });
          
                  console.log(`Booking status updated to '${updatedStatus}'`);
                  booking.status = updatedStatus; 
                }
          
                // Return the updated payment and booking
                return {
                  message: 'Payment verified successfully',
                  payment: updatedPayment,
                  booking,
                };
              });
            } catch (error) {
              if (error instanceof Prisma.PrismaClientKnownRequestError) {
                throw new InternalServerErrorException(
                  'A database error occurred while verifying payment'
                );
              }
          
              console.error('Error verifying payment:', error.message);
              throw new InternalServerErrorException('Failed to verify payment');
            }}
    
    
            deletePayment(id: any) {
        throw new Error('Method not implemented.');
    }
}
