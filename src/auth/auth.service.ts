//auth/auth.service.ts
import { ConflictException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { Prisma, PrismaClient, ROLE } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { AuthDto } from "./dto";
import * as argon from "argon2";
import { JwtService } from "@nestjs/jwt";
import { SigninDto } from "./dto/signin.dto";
import { SignupDto } from "./dto/signup.dto";

@Injectable({})
export class AuthService{


    constructor (private  prisma:PrismaService,private jwt:JwtService ){}

    async signup(dto:SignupDto){
        
        const email = dto.email;
        const hash = await argon.hash(dto.password);
        const name = dto.name;
        const user_phone = dto.user_phone;
        const secondary_user_phone = dto.secondary_user_phone;

        try{
            const user = await this.prisma.user.create({
                data:{
                    email:email,
                    password_hash : hash,
                    name:name,
                    user_phone:user_phone,
                    secondary_user_phone:secondary_user_phone,
                }
            })
            return this.signToken(user.id,user.email,user.role);

        }
        catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
              // Handle unique constraint violation
              if (error.code === 'P2002') {
                throw new ConflictException('Email or phone number already exists');
              }
            }
            throw new InternalServerErrorException('An unexpected error occurred: ', error.message);
          }
    }



    async signin(req: SigninDto) {
        try {
          const { email, password } = req;
      
        const user = await this.prisma.user.findUnique({
          where: { email },
        });
      
        if (!user || !user.password_hash) {
          throw new UnauthorizedException('Invalid email or password');
        }
      
        const match = await argon.verify(user.password_hash, password);
        if (!match) {
          throw new UnauthorizedException('Invalid email or password');
        }
      
        return this.signToken(user.id, user.email, user.role);

        } catch (error) {
          throw new InternalServerErrorException('Failed to sign in', error.message);
          
        }
      }
      

    async signToken(userid: string, email: string, role: string[]): Promise<{ access_token: string }> {
        try {
          const payload = { sub: userid, email,role };
        const token = await this.jwt.signAsync(payload, {
            expiresIn: "10d",
            secret: process.env.JWT_SECRET,
        });
        return {
            access_token: token,
        };
        } catch (error) {
          throw new InternalServerErrorException('Failed to sign token', error.message)
          
        }
    }


    async changePassword(id: string ,dto: any) {
        const { oldPassword, newPassword } = dto;
        const user = await this.prisma.user.findUnique({ where: { id} });
          if (!user) {
            throw new NotFoundException('user not found');
          }
          const match = await argon.verify(user.password_hash, oldPassword);
          if (!match) {
              throw new UnauthorizedException('Incorrect old Password');
          }
          const hash = await argon.hash(newPassword);
              await this.prisma.user.update({ where: { id}, data: {
                password_hash: hash
                }
                });
        return { message: 'Password changed successfully' };
    
}}