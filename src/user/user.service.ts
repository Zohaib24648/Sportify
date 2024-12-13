import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserSearchDto } from './dto/usersearch.dto';
import { User } from '@prisma/client';
import { UpdateUserDto } from './dto/updateuser.dto';
import { UploadService } from 'src/upload/upload.service';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService , private readonly uploadService: UploadService) {}

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
    const { userId } = dto;
    const user = await this.prisma.user.findUnique({ where: { id: userId }
    }
  );
    if (!user) {
      throw new NotFoundException('User not found');
    }
    delete user.password_hash;
    if(user.user_pfp_link){
      user.user_pfp_link = await this.uploadService.getFileUrl(user.user_pfp_link);}
    return user;
  }

  async updateUser(dto: any, dto1: UpdateUserDto, dto2: Express.Multer.File) {
 try {
  const { userId } = dto;
  const { name } = dto1;

  const user = await this.prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new NotFoundException('User not found');
  }

  const data: any = { name };

  if (dto2) {
    const uploadResult = await this.handleProfilePic(dto2);
    data.user_pfp_link = uploadResult.filename;
  }

  const updated_user =  await this.prisma.user.update({
    where: { id: userId },
    data,
  });

  delete updated_user.password_hash;
  if(updated_user.user_pfp_link){
    updated_user.user_pfp_link = await this.uploadService.getFileUrl(updated_user.user_pfp_link);}
  return updated_user;
 } catch (error) {
  throw new InternalServerErrorException('Failed to update user', error.message);
 }
    }




  async getBookingHistory(dto: any) {
    const { userId } = dto;
    return await this.prisma.booking.findMany({
      where: { user_id: userId },
    });
  }

  async handleProfilePic( user_pfp_link: Express.Multer.File) {

    try {
      const upload_file = await this.uploadService.uploadFile(user_pfp_link);
      const filename = upload_file.filename;
      return {filename};
    } catch (error) {
      throw new NotFoundException('Failed to upload file', error.message);
    }
  }

  async getPaymentHistory(dto: any) {
    const { userId } = dto;
    const paymentHistory = await this.prisma.booking.findMany({
      where: { user_id: userId },
      include: { payment: true },
    });
  
    return paymentHistory.flatMap((booking) => booking.payment);
  }
}
