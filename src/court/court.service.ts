//court/court.service.ts

import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CourtDto } from 'src/auth/dto/court.dto';
import { CourtSpecDto } from 'src/auth/dto/court_spec.dto';
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

    async get_Courts(){
        return this.prisma.court.findMany();
    }

    async get_court_details(id:string){       
        
            const court = await this.prisma.court.findFirst({
                where:{
                    id:id
                } 
    
            })
            if (court === null){
                return "Court not found"
            }       
            return court;

    }

    async updateCourt(id: string, dto: CourtDto) {
        try {
            console.log('Received DTO for update:', dto);
            const updatedCourt = await this.prisma.court.update({
                where: {
                    id: id,
                },
                data: {
                    ...dto,
                },
            });
            console.log('Court updated successfully:', updatedCourt);
            return updatedCourt;
        } catch (error) {
            console.error('Error updating court:', error);
    
            // Specific handling for the P2025 error
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2025') {
                    throw new Error(`Court with ID ${id} not found.`);
                }
            }
    
            // General error
            throw new Error('An error occurred while updating the court.');
        }
    }
    
    

    async deleteCourt(id: string): Promise<string> {
        try {
            const deletedCourt = await this.prisma.court.delete({
                where: {
                    id: id,
                },
            });
            
            return "Court deleted successfully";
        } catch (error) {
            if (error.code === 'P2025') {
                return "Court not found";
            }
            throw new Error("An error occurred while deleting the court");
        }
    }

    async get_court_specs(id:string){
        const court_specs= await this.prisma.court_Specs.findMany({
            where:{
                court_id:id
            }
        })
        console.log(court_specs)
        return court_specs;}
    
        async add_court_spec(id:string, specsdto:CourtSpecDto){
            const court_spec = await this.prisma.court_Specs.create({
                data:{
                    name:specsdto.name,
                    value:specsdto.value,
                    court_id:id
                }
            })
            console.log(court_spec)
            return court_spec;}


            async update_court_spec(id: string, dto: any) {
                try {
                    const court_spec = await this.prisma.court_Specs.update({
                        where: {
                            id: id,
                        },
                        data: {
                            ...dto,
                        },
                    });
                    console.log('Court spec updated successfully:', court_spec);
                    return court_spec;
                } catch (error) {
                    console.error('Error updating court spec:', error);
            
                    // Handle specific Prisma errors
                    if (error instanceof Prisma.PrismaClientKnownRequestError) {
                        if (error.code === 'P2025') {
                            throw new Error(`Court spec with ID ${id} not found.`);
                        }
                    }
            
                    // Handle any other errors
                    throw new Error('An error occurred while updating the court spec.');
                }
            }

            async delete_court_spec(id:string){
                const court_spec = await this.prisma.court_Specs.delete({
                    where:{
                        id:id
                    }
                })
                return court_spec;
            }
            


            async update_court_availability(id:string, dto:any){
                
                const court_availability = await this.prisma.court_Availability.update(
                    {
                        where:{
                            court_id :id
                        },
                        data:{
                            ...dto
                    }}
                )
                console.log(court_availability)
                return court_availability;}
            
            
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

            



