import { Injectable } from '@nestjs/common';
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
}
