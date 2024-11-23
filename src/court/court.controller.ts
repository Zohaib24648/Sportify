//court/court.controller.ts
import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { CourtService } from './court.service';
import { CourtDto } from 'src/court/dto/court.dto';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/auth/guard/roles.decorator';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { ROLE } from '@prisma/client';
import { CourtSpecDto } from 'src/court/dto/court_spec.dto';
import { CourtAvailabilityDto } from './dto/courtavailability.dto';


@Controller('court')
export class CourtController {
    constructor(private court_service:CourtService) {}
    
    
    
    //Create Court
    
    @Roles('admin')
    @UseGuards(AuthGuard('jwt'),RolesGuard)
    @Post('create_court')
    createCourt(@Body () dto:CourtDto){
        return this.court_service.createCourt(dto);
    }
    

    //Get Courts
    @UseGuards(AuthGuard('jwt'))
    @Get('get_courts')
    getCourts(){
        return this.court_service.get_Courts();
    }

    
    //Update Court

    @Roles('admin')
    @UseGuards(AuthGuard('jwt'),RolesGuard)
    @Put('update_court/:id')
    updateCourt(@Param('id') id:string,  @Body() dto:CourtDto){
        return this.court_service.updateCourt(id,dto);
    }

    //Update Court Availability
    @Roles('admin')
    @UseGuards(AuthGuard('jwt'),RolesGuard)
    @Put('upsert_court_availability/:id')
    uCourpserttAvailability(@Param('id') id:string, @Body() dto:CourtAvailabilityDto){
        return this.court_service.upsert_court_availability(id,dto);
    }




    //Delete Court
    @Roles('admin')
    @UseGuards(AuthGuard('jwt'),RolesGuard)
    @Delete('delete_court/:id')
    deleteCourt(@Param('id') id:string){
        return this.court_service.deleteCourt(id);
    }


    //Get Court Details
    @UseGuards(AuthGuard('jwt'))
    @Get('get_court_details/:id')
    get_court_details(@Param('id') id:string){
        return this.court_service.get_court_details(id);
    }


    // Add Court Specs
    @Roles('admin')
    @UseGuards(AuthGuard('jwt'),RolesGuard)
    @Post ('add_court_specs/:id')
    add_court_specs(@Param('id') id:string, @Body() dto:CourtSpecDto){
        return this.court_service.add_court_spec(id,dto);
    }


    //Get Court Specs
    @UseGuards(AuthGuard('jwt'))
    @Get ('get_court_specs/:id')
    get_court_specs(@Param('id') id:string){
        return this.court_service.get_court_specs(id);
    }



        //Delete Court Specs
        @Roles('admin')
        @UseGuards(AuthGuard('jwt'))
        @Delete ('delete_court_spec/:id')
        delete_court_spec(@Param('id') id:string){
            return this.court_service.delete_court_spec(id);
        }

      // Update Court Specs
    
      @Roles('admin')
      @UseGuards(AuthGuard('jwt'),RolesGuard)
      @Post ('update_court_specs/:id')
      update_court_specs(@Param('id') id:string, @Body() dto:CourtSpecDto){
          return this.court_service.update_court_spec(id,dto);
      }
}
