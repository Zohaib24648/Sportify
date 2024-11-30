import { Injectable,NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma//prisma.service';
import { UserSearchDto } from './dto/usersearch.dto';

@Injectable()
export class UserService {

    constructor(private readonly prisma: PrismaService) {}


    async searchUsers(dto: UserSearchDto) {
        const { searchTerm } = dto;
    
        const users = await this.prisma.user.findMany({
          where: {
            OR: [
              { name: { contains: searchTerm, mode: 'insensitive' } },
              { email: { contains: searchTerm, mode: 'insensitive' } },
              { user_phone: { contains: searchTerm, mode: 'insensitive' } },
            ],
          },
        });
    
        return users;
      }




    async getMe(dto: any) {
      const {userId} = dto;
      try {
        const user = await this.prisma.user.findUnique({ where: { id :userId } });
        if (!user) {
          throw new NotFoundException('User not found');
          }
        return user;
      } catch (error) {
        throw new NotFoundException('User not found', error.message);
      }
    }


    async getBookingHistory(dto: any) {
      const {userId} = dto;
      try {
        const bookingHistory = await this.prisma.booking.findMany({ where: {user_id: userId } });
        return bookingHistory;
      } catch (error) {
        throw new NotFoundException('Booking history not found', error.message);
      }
      }


      async getPaymentHistory(dto: any) {
        const {userId} = dto;
        try {
          const paymentHistory = await this.prisma.booking.findMany({ where: {user_id: userId },
          include : {
            payment: true
          }

          });

          const payments = paymentHistory.flatMap(booking => booking.payment);
          return payments;
        } catch (error) {
          throw new NotFoundException('Payment history not found', error.message);
        }
        }
}
