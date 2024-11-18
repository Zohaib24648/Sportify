import { Controller } from '@nestjs/common';
import { Body, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/guard/roles.decorator';
import { GameService } from './game.service';


@Controller('game')
export class GameController {
    constructor(private game_service: GameService) {}


    
    // Create Game
    @Roles('admin')
    @UseGuards(AuthGuard('jwt'),RolesGuard)
    @Post('create_game')
    create_game(@Body() dto: any) {
        return this.game_service.create_game(dto);
        }


    // Get Games
    @UseGuards(AuthGuard('jwt'))
    @Get('get_games')
    get_games() {
        return this.game_service.get_games();
    }

    // Delete Game
    @Roles('admin')
    @UseGuards(AuthGuard('jwt'),RolesGuard)
    @Delete('delete_game/:id')
    delete_game(@Param('id') id: string) {
        return this.game_service.delete_game(id);
    }


    // Update Game
    @Roles('admin')
    @UseGuards(AuthGuard('jwt'),RolesGuard)
    @Post('update_game/:id')
    update_game(@Param('id') id: string, @Body() dto: any) {
        return this.game_service.update_game(id, dto);
    }

    // Add Game to Court
    @Roles('admin')
    @UseGuards(AuthGuard('jwt'),RolesGuard)
    @Post('add_game_to_court')
    add_court_games(@Body() dto: any) {
        return this.game_service.addGameToCourt(dto);
    }


    // Delete Game from Court
    @Roles('admin')
    @UseGuards(AuthGuard('jwt'),RolesGuard)
    @Delete('delete_game_from_court')
    delete_court_games(@Body() dto: any ) {
        return this.game_service.delete_court_game(dto);
    }



    // Get Court Games
    @UseGuards(AuthGuard('jwt'))
    @Get('get_court_games/:id')
    get_court_games(@Param('id') id: string) {
        return this.game_service.get_court_games(id);
    }

}
