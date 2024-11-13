import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import { CourtDto } from 'src/auth/dto/court.dto';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { PrismaService } from 'src/prisma/prisma.service';


@Injectable()
export class CourtService {

    constructor (private  prisma:PrismaService ){}
    async createCourt(dto:CourtDto){
        console.log(dto)
        const court_name = dto.name;
        const court_location = dto.court_location;
        const min_down_payment=dto.min_down_payment;
        const hourly_rate = dto.hourly_rate;
        const description = dto.description;


        const court = await this.prisma.court.create(
            {
                data:{
                    name:court_name,
                    court_location:court_location,
                    min_down_payment:min_down_payment,
                    hourly_rate:hourly_rate,
                    description:description

                    
                }
            }

        )

        return court
    }

    get_Courts(){
        return 'Court fetched';
    }
}
