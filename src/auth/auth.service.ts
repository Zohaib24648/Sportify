import { Injectable } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { authDto } from "./dto";
import * as argon from "argon2";
import { JwtService } from "@nestjs/jwt";

@Injectable({})
export class AuthService{


    constructor (private  prisma:PrismaService,private jwt:JwtService ){}
    async signup(req:authDto){
        
        const email = req.email;
        const hash = await argon.hash(req.password);
        console.log(email,hash)

        const user = await this.prisma.user.create({
            data:{
                email:email,
                hash : hash,
                name:"test"
            }
        })

        return "this is the sign up route from service"
    }

    async signin( req:authDto){
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
        const match = await argon.verify(user.hash,req.password)
        if (match){
            return this.signToken(user.id,user.email)
        }
        return "incorrect password"


        //if the user is found then match the password for that user
        //if the password is correct then return the user
    }

    async signToken(userid: number, email: string): Promise<{ access_token: string }> {
        const payload = { sub: userid, email };
        const token = await this.jwt.signAsync(payload, {
            expiresIn: "15m",
            secret: process.env.JWT_SECRET,
        });
        return {
            access_token: token,
        };
    }
    
}