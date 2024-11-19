import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { GameDto } from './dto/game.dto';
import { AddGameCourtDto } from './dto/addgamecourt.dto';

@Injectable()
export class GameService {

    constructor(private prisma: PrismaService) {}


    async create_game(dto: GameDto){
        try {
             await this.prisma.game_Type.create({
              data: { ...dto },
            });
          } 
          catch (error) {
            throw new InternalServerErrorException('Failed to create game');
          }
    }

    async get_games(){
        const games = await this.prisma.game_Type.findMany()
        return games;
    }


    async delete_game(id:string){
        try {
            return await this.prisma.game_Type.delete({ where: { id } });
          }
           catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
              if (error.code === 'P2025') {
                throw new NotFoundException(`Game with ID ${id} not found`);
              }
            }
            throw new InternalServerErrorException('Failed to delete game');
          }
    }

    async update_game(id:string, dto:GameDto){
        try {
             return await this.prisma.game_Type.update({
              where: { id },
              data: { ...dto },
            });
          } catch (error) {
            throw new InternalServerErrorException('Failed to update game');
          }
    }



    async addGameToCourt(dto:AddGameCourtDto) {

        try {
    
            // Link the game to the court
            const courtGameType = await this.prisma.court_Game_Type.create({
                data: {
                  ...dto,
                },
            });
            return courtGameType;
        } catch (error) {
            console.error('Error linking game to court:', error);
    
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                throw new Error(`Game is already linked to this court.`);
            }
    
            throw new Error('Failed to link game to court');
        }
    }


    async get_court_games(id:string){
        const court_games = await this.prisma.court_Game_Type.findMany({
            where:{
                court_id:id
            }
        })
        return court_games;
    }


    async delete_court_game(dto: AddGameCourtDto) {
        try {
            const game_type_id = dto.game_type_id;
            const court_id = dto.court_id;
                
            const court_game = await this.prisma.court_Game_Type.deleteMany({
                where: {
                    court_id: court_id,
                    game_type_id: game_type_id,
                },
            });
    
            console.log('Game deleted successfully:', court_game);
            return court_game;
        } catch (error) {
                if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2025') {
                    throw new Error('Game type or court not found.');
                }
            }
    
            throw new Error('An error occurred while deleting the game from the court.');
        }
    }
    
    
    



}
