//auth/auth.service.ts
import { Injectable } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { AuthDto } from "./dto";
import * as argon from "argon2";
import { JwtService } from "@nestjs/jwt";
import { SigninDto } from "./dto/signin.dto";
import { SignupDto } from "./dto/signup.dto";

@Injectable({})
export class AuthService{


    constructor (private  prisma:PrismaService,private jwt:JwtService ){}
    async signup(req:SignupDto){
        
        const email = req.email;
        const hash = await argon.hash(req.password);
        const name = req.name;
        const user_phone = req.user_phone;

        const user = await this.prisma.user.create({
            data:{
                email:email,
                password_hash : hash,
                name:name,
                user_phone:user_phone,
                role:"user"
                
            }
        })
        return this.signToken(user.id,user.email,user.name,user.role)
    }

    async signin( req:SigninDto){
        console.log(req)
        // return "this is the sign in route from service"
        //check the database for the user
        const user = await this.prisma.user.findFirst({
            where:{
                email:req.email
            }
        })

        if (!user){
            return "user not found"
        }
        const match = await argon.verify(user.password_hash,req.password)
        if (match){
            return this.signToken(user.id,user.email,user.role,user.name)
        }
        return "incorrect password"
        //if the password is correct then return the token
        
    }

    async signToken(userid: string, email: string, role: string, name:string): Promise<{ access_token: string }> {
        const payload = { sub: userid, email,role };
        const token = await this.jwt.signAsync(payload, {
            expiresIn: "10d",
            secret: process.env.JWT_SECRET,
        });
        return {
            access_token: token,
        };
    }
    
}