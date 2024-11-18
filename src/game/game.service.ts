import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class GameService {

    constructor(private prisma: PrismaService) {}


    async create_game(dto:any){
        const game = await this.prisma.game_Type.create({
            data:{
                name:dto.name
            }
        })
        return game;
    }

    async get_games(){
        const games = await this.prisma.game_Type.findMany()
        return games;
        }


    async delete_game(id:string){
        const game = await this.prisma.game_Type.delete({
            where:{
                id:id
            }
        })
        return game;
    }

    async update_game(id:string, dto:any){
        const game = await this.prisma.game_Type.update({
            where:{
                id:id
            },
            data:{
                ...dto
            }
        })
        return game;
    }



    async addGameToCourt(dto:any) {
        const courtId = dto.courtId;
        const gameId = dto.gameId;

        console.log('Adding game to court:', courtId, gameId);
        try {
    
            // Link the game to the court
            const courtGameType = await this.prisma.court_Game_Type.create({
                data: {
                    court_id: courtId,
                    game_type_id: gameId,
                },
            });
    
            console.log('Game linked to court:', courtGameType);
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
        console.log(court_games)
        return court_games;
    }


    async delete_court_game(dto: any) {
        try {
            const game_type_id = dto.game_type_id;
            const court_id = dto.court_id;
    
            console.log('Deleting game with ID:', game_type_id, 'from court with ID:', court_id);
            
            const court_game = await this.prisma.court_Game_Type.deleteMany({
                where: {
                    court_id: court_id,
                    game_type_id: game_type_id,
                },
            });
    
            console.log('Game deleted successfully:', court_game);
            return court_game;
        } catch (error) {
            console.error('Error deleting game from court:', error);
    
            // Specific handling for Prisma errors (e.g., if needed)
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2025') {
                    throw new Error('Game type or court not found.');
                }
            }
    
            throw new Error('An error occurred while deleting the game from the court.');
        }
    }
    
    
    



}
