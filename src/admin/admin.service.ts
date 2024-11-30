import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SignupDto } from 'src/auth/dto';
import { AuthService } from 'src/auth/auth.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateUserDto } from './dto/updateuser.dto';
import * as argon from 'argon2';

@Injectable()
export class AdminService {
    constructor(private readonly authService: AuthService , private readonly prisma : PrismaService) {}

    //Create User

   async createUser(dto: SignupDto) {

    const user = await this.authService.signup(dto);
    return user;    
}

    async deleteUser(id: string) {
        
    try {
        return await this.prisma.user.delete({
            where: {
                id: id
            }
        });
    } catch (error) {
        throw new InternalServerErrorException('Error deleting user',error.message);
    }
}
async updateUser(id: string, dto: UpdateUserDto) {
    if(dto.password_hash){
    dto.password_hash = await argon.hash(dto.password_hash);}
        console.log(dto);
    try {
        return await this.prisma.user.update({
            where: {
                id: id
            },
            data: {
                ...dto
                 }


        });
    } catch (error) {
        throw new InternalServerErrorException('Error updating user',error.message);
    }
}


async getUsers() {
    return await this.prisma.user.findMany();
}



}
