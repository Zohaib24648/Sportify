import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { GameDto } from './dto/game.dto';
import { AddGameCourtDto } from './dto/addgamecourt.dto';
import { CourtService } from 'src/court/court.service';

@Injectable()
export class GameService {

    constructor(private readonly prisma: PrismaService, private readonly courtService : CourtService   ) {}


    async create_game(dto: GameDto){
        try {
             const game = await this.prisma.game_Type.create({
              data: { ...dto },
            });
            return game;
          } 
          catch (error) {
            throw new InternalServerErrorException('Failed to create game',error.message);
          }
    }

    async get_games(){
        try {
            const games = await this.prisma.game_Type.findMany()
            return games;
        } catch (error) {
            throw new InternalServerErrorException('Failed to retrieve games',error.message);
        }
    }

    async get_game(id : string){
        try {
            const games = await this.prisma.game_Type.findFirst(
                {
                    where:{
                        id:id
                    }
                }
            )
            return games;
        } catch (error) {
            throw new NotFoundException('Game not found',error.message
                );
                }
    }



    async delete_game(id:string){
        try {
            await this.prisma.$transaction(async (prisma) =>{ 
            await this.prisma.game_Type.delete({ where: { id } });
            await this.prisma.court_Game_Type.deleteMany({ where: { game_type_id: id } });
            });
          }
           catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
              if (error.code === 'P2025') {
                throw new NotFoundException(`Game with ID ${id} not found`);
              }
            }
            throw new InternalServerErrorException('Failed to delete game',error.message);
          }
    }

    async update_game(id:string, dto:GameDto){
        console.log ("BODY",dto);
        try {
             return await this.prisma.game_Type.update({
              where: { id },
              data: { ...dto },
            });
          } catch (error) {
            throw new InternalServerErrorException('Failed to update game',error.message);
          }
    }



    async addGameToCourt(dto:AddGameCourtDto) {
        const {court_id, game_type_id}    = dto;

        try {
            //verify that court and game exist
            const court = await this.courtService.get_court_details(court_id);
            const game = await this.get_game(game_type_id);

            if (!court || !game) {
                throw new Error('Court or game not found');
            }
    
            // Link the game to the court
            const courtGameType = await this.prisma.court_Game_Type.create({
                data: {
                  ...dto,
                },
            });
            return courtGameType;
        } catch (error) {    
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                throw new ConflictException(`Game is already linked to this court.`);
            }
            
            throw new InternalServerErrorException('Failed to add game to court',error.message);
        }
    }


    async get_court_games(id:string){
        try {
            const court_games = await this.prisma.court_Game_Type.findMany({
                where:{
                    court_id:id
                },
                include:{
                    game_type:true
                    }
            })
            return court_games;
        } catch (error) {
            
            throw new InternalServerErrorException('Failed to retrieve court games',error.message);
        }
    }


    async delete_court_game(dto: AddGameCourtDto) {
        try {                
            const court_game = await this.prisma.court_Game_Type.deleteMany({
                where: {
                   ...dto
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
    
            throw new InternalServerErrorException('An error occurred while deleting the game from the court.',error.message);
        }
    }
    
    
    



}
