import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CourtService } from './court.service';
import { CourtDto } from 'src/auth/dto/court.dto';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/auth/guard/roles.decorator';
import { RolesGuard } from 'src/auth/guard/roles.guard';


@Controller('court')
export class CourtController {
    constructor(private court_service:CourtService) {}
    @Roles('admin')
    @UseGuards(AuthGuard('jwt'),RolesGuard)
    @Post('create')
    createCourt(@Body () dto:CourtDto){
        return this.court_service.createCourt(dto);
    }
    
    @Get('get_courts')
    getCourts(){
        return this.court_service.get_Courts();
    }
}
