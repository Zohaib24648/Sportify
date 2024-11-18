//court/court.service.ts

import { BadRequestException, Injectable } from '@nestjs/common';
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
                } ,
                include: {
                    court_specs: true,
                    court_availability: true,
                    court_media: true,
                    slots: true,
                    reviews: true,
                    game_types: true,
                  },
    
            })      
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
            throw new BadRequestException('An error occurred while updating the court.');
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
            


            async upsert_court_availability(id: string, dto: any) {
                console.log('DTO:', dto);
              
                const court_availability = await this.prisma.court_Availability.upsert({
                  where: {
                    court_id: id, // Use the court_id to find the record
                  },
                  update: {
                    ...dto, // Update existing fields
                  },
                  create: {
                    court_id: id, // Include the id for the new record
                    ...dto,       // Add fields from dto for creation
                  },
                });
              
                console.log('Court Availability:', court_availability);
                return court_availability;
              }
              
            
            
            
            
            }

            



