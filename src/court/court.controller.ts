//court/court.controller.ts
import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { CourtService } from './court.service';
import { CourtDto } from 'src/auth/dto/court.dto';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/auth/guard/roles.decorator';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Role } from '@prisma/client';
import { CourtSpecDto } from 'src/auth/dto/court_spec.dto';


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
    updateCourt(@Param('id') id:string,  @Body() dto:any){
        return this.court_service.updateCourt(id,dto);
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
    add_court_specs(@Param('id') id:string, @Body() dto:any){
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
      update_court_specs(@Param('id') id:string, @Body() dto:any){
          return this.court_service.update_court_spec(id,dto);
      }


    

      


  
    // Update Court Availability

    @Roles('admin')
    @UseGuards(AuthGuard('jwt'),RolesGuard)
    @Post ('update_court_availability/:id')
    update_court_availability(@Param('id') id:string, @Body() dto:any){
        return this.court_service.update_court_availability(id,dto);
    }
   
   


    // Create Game
    @Roles('admin')
    @UseGuards(AuthGuard('jwt'),RolesGuard)
    @Post('create_game')
    create_game(@Body() dto: any) {
        return this.court_service.create_game(dto);
        }


    // Get Games
    @UseGuards(AuthGuard('jwt'))
    @Get('get_games')
    get_games() {
        return this.court_service.get_games();
    }

    // Delete Game
    @Roles('admin')
    @UseGuards(AuthGuard('jwt'),RolesGuard)
    @Delete('delete_game/:id')
    delete_game(@Param('id') id: string) {
        return this.court_service.delete_game(id);
    }


    // Update Game
    @Roles('admin')
    @UseGuards(AuthGuard('jwt'),RolesGuard)
    @Post('update_game/:id')
    update_game(@Param('id') id: string, @Body() dto: any) {
        return this.court_service.update_game(id, dto);
    }

    // Add Game to Court
    @Roles('admin')
    @UseGuards(AuthGuard('jwt'),RolesGuard)
    @Post('add_game_to_court')
    add_court_games(@Body() dto: any) {
        return this.court_service.addGameToCourt(dto);
    }


    // Delete Game from Court
    @Roles('admin')
    @UseGuards(AuthGuard('jwt'),RolesGuard)
    @Delete('delete_game_from_court')
    delete_court_games(@Body() dto: any ) {
        return this.court_service.delete_court_game(dto);
    }



}
