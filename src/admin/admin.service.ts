import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SignupDto } from 'src/auth/dto';
import { AuthService } from 'src/auth/auth.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateUserDto } from './dto/updateuser.dto';
import * as argon from 'argon2';
import { TimeDto } from 'src/slot/dto/time.dto';
import dayjs from 'dayjs';

@Injectable()
export class AdminService {
  constructor(
    private readonly authService: AuthService,
    private readonly prisma: PrismaService,
  ) {}

  //Create User

  async createUser(dto: SignupDto) {
    const user = await this.authService.signup(dto);
    return user;
  }

  async deleteUser(id: string) {
    try {
      return await this.prisma.user.delete({
        where: {
          id: id,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Error deleting user',
        error.message,
      );
    }
  }
  async updateUser(id: string, dto: UpdateUserDto) {
    if (dto.password_hash) {
      dto.password_hash = await argon.hash(dto.password_hash);
    }
    console.log(dto);
    try {
      return await this.prisma.user.update({
        where: {
          id: id,
        },
        data: {
          ...dto,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Error updating user',
        error.message,
      );
    }
  }

  async getUsers() {
    return await this.prisma.user.findMany();
  }

  //Dashboard Apis

  async getbookingcount(dto: TimeDto) {
    const { start_time, end_time } = dto;

    const total_bookings_count = await this.prisma.booking.count({
      where: {
        slot: {
          start_time: {
            gte: start_time,
            lte: end_time,
          },
        },
      },
    });

    return total_bookings_count;
  }

  async getDashboardData(dto: TimeDto) {
    const { start_time, end_time } = dto;

    const total_bookings_count = await this.getbookingcount(dto);
    const total_users = await this.prisma.user.count();

    const total_bookings = await this.prisma.booking.findMany({
      select: {
        id: true,
        booking_id: true,
        total_amount: true,
        paid_amount: true,
        status: true,
        slot: true,
        user: {
          select: {
            name: true,
            user_phone: true,
          },
        },
      },

      where: {
        slot: {
          start_time: {
            gte: start_time,
            lte: end_time,
          },
        },
      },
    });

    let total_amount = 0;
    let total_paid_amount = 0;
    for (const booking of total_bookings) {
      if (booking.status !== 'cancelled') {
        total_amount += booking.total_amount;
        total_paid_amount += booking.paid_amount;
      }
    }

    return {
      total_bookings_count,
      total_users,
      total_amount,
      total_paid_amount,
      total_bookings,
    };
  }
}
