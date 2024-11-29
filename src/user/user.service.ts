import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
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
      const {userId, email , role} = dto;
      try {
        const user = await this.prisma.user.findUnique({ where: { id :userId } });
        return user;
      } catch (error) {
        throw new NotFoundException('User not found', error.message);
      }
    }
}
