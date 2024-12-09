import { Controller, Put } from '@nestjs/common';
import { Body, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/guard/roles.decorator';
import { GameService } from './game.service';
import { GameDto } from './dto/game.dto';
import { AddGameCourtDto } from './dto/addgamecourt.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UpdateGameCourtDto } from './dto/updategamecourt.dto';

@ApiTags('Games')
@Controller('game')
export class GameController {
  constructor(private game_service: GameService) {}

  @ApiOperation({ summary: 'Create a new game' })
  @ApiResponse({ status: 201, description: 'Game created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiBearerAuth()
  // Create Game
  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post('create_game')
  create_game(@Body() dto: GameDto) {
    return this.game_service.create_game(dto);
  }

  @ApiOperation({ summary: 'Retrieve all games' })
  @ApiResponse({ status: 200, description: 'List of games retrieved' })
  @ApiBearerAuth()
  // Get Games
  @UseGuards(AuthGuard('jwt'))
  @Get('get_games')
  get_games() {
    return this.game_service.get_games();
  }

  @ApiOperation({ summary: 'Delete a game by ID' })
  @ApiResponse({ status: 200, description: 'Game deleted successfully' })
  @ApiResponse({ status: 404, description: 'Game not found' })
  @ApiBearerAuth()
  // Delete Game
  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Delete('delete_game/:id')
  delete_game(@Param('id') id: string) {
    return this.game_service.delete_game(id);
  }

  @ApiOperation({ summary: 'Update a game by ID' })
  @ApiResponse({ status: 200, description: 'Game updated successfully' })
  @ApiResponse({ status: 404, description: 'Game not found' })
  @ApiBearerAuth()
  // Update Game
  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Put('update_game/:id')
  update_game(@Param('id') id: string, @Body() dto: GameDto) {
    return this.game_service.update_game(id, dto);
  }

  
  

  @ApiOperation({ summary: 'Update games for a court' })
  @ApiResponse({
    status: 200,
    description: 'Games successfully updated for court',
  })
  @ApiResponse({ status: 404, description: 'Game or court not found' })
  @ApiBearerAuth()
  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Put('update_court_games')
  update_court_games(@Body() dto: AddGameCourtDto) {
    return this.game_service.updateCourtGames( dto);
  }
  

  @ApiOperation({ summary: 'Retrieve a game by ID (Admin and User)' })
  @ApiResponse({ status: 200, description: 'Game retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Game not found' })
  @ApiBearerAuth()
  @Roles('admin', 'user')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get('get_game/:id')
  get_game(@Param('id') id: string) {
    return this.game_service.get_game(id);
  }

  // @ApiOperation({ summary: 'Delete a game from a court' })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Game successfully deleted from court',
  // })
  // @ApiResponse({ status: 404, description: 'Game or court not found' })
  // @ApiBearerAuth()
  // // Delete Game from Court
  // @Roles('admin')
  // @UseGuards(AuthGuard('jwt'), RolesGuard)
  // @Delete('delete_game_from_court')
  // delete_court_games(@Body() dto: AddGameCourtDto) {
  //   return this.game_service.delete_court_game(dto);
  // }

  @ApiOperation({ summary: 'Get all games for a specific court' })
  @ApiResponse({ status: 200, description: 'List of court games retrieved' })
  @ApiResponse({ status: 404, description: 'Court not found' })
  @ApiBearerAuth()
  // Get Court Games
  @UseGuards(AuthGuard('jwt'))
  @Get('get_court_games/:id')
  get_court_games(@Param('id') id: string) {
    return this.game_service.get_court_games(id);
  }
}


