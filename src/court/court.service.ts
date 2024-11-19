//court/court.service.ts

import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CourtDto } from 'src/court/dto/court.dto';
import { CourtSpecDto } from 'src/court/dto/court_spec.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CourtAvailabilityDto } from './dto/courtavailability.dto';


@Injectable()
export class CourtService {

    constructor (private  prisma:PrismaService ){}


    
    
    async createCourt(dto: CourtDto) {
        const { name, hourly_rate, min_down_payment } = dto;
      
        if (hourly_rate <= 0 || min_down_payment < 0) {
          throw new BadRequestException('Invalid hourly rate or down payment');
        }
      
        const existingCourt = await this.prisma.court.findFirst({
          where: { name },
        });
      
        if (existingCourt) {
          throw new ConflictException('Court with this name already exists');
        }
      
        return this.prisma.court.create({
          data: dto,
        });
      }


      

    async get_Courts(){
        return this.prisma.court.findMany();
    }



    async get_court_details(id: string) {
        try {
          const court = await this.prisma.court.findUnique({
            where: { id },
            include: {
              court_specs: true,
              court_availability: true,
              court_media: true,
              slots: true,
              reviews: true,
              game_types: true,
            },
          });
      
          if (!court) {
            throw new NotFoundException(`Court with ID ${id} not found`);
          }
      
          return court;
        } catch (error) {
          throw new InternalServerErrorException('Failed to retrieve court details');
        }
      }
      

    async updateCourt(id: string, dto: CourtDto) {
        try {
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
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
              if (error.code === 'P2025') {
                throw new NotFoundException(`Court with ID ${id} not found`);
              }
            }
            throw new InternalServerErrorException('Failed to update court');
          }
    }
    
    

    async deleteCourt(id: string): Promise<string> {
        try {
          const court = await this.prisma.court.findUnique({ where: { id } });
          if (!court) {
            throw new NotFoundException(`Court with ID ${id} not found`);
          }
      
          await this.prisma.court.delete({ where: { id } });
          return 'Court deleted successfully';
        } catch (error) {
          if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            throw new NotFoundException(`Court with ID ${id} not found`);
          }
          throw new InternalServerErrorException('Failed to delete court');
        }
      }
      


      async get_court_specs(court_id: string) {
        try {
          const court = await this.prisma.court.findUnique({ where: { id: court_id } });
          if (!court) {
            throw new NotFoundException(`Court with ID ${court_id} not found`);
          }
      
          return await this.prisma.court_Specs.findMany({ where: { court_id } });
        } catch (error) {
          throw new InternalServerErrorException('Failed to retrieve court specifications');
        }
      }
      
      async add_court_spec(court_id: string, specsdto: CourtSpecDto) {
        try {
          const court = await this.prisma.court.findUnique({ where: { id: court_id } });
          if (!court) {
            throw new NotFoundException(`Court with ID ${court_id} not found`);
          }
      
          return await this.prisma.court_Specs.create({
            data: {
            ...specsdto,
              court_id,
            },
          });
        } catch (error) {
          throw new InternalServerErrorException('Failed to add court specification');
        }
      }

      

      async update_court_spec(id: string, dto: CourtSpecDto) {
        try {
          const court_spec = await this.prisma.court_Specs.findUnique({ where: { id } });
          if (!court_spec) {
            throw new NotFoundException(`Court specification with ID ${id} not found`);
          }
      
          return await this.prisma.court_Specs.update({
            where: { id },
            data: dto,
          });
        } catch (error) {
          throw new InternalServerErrorException('Failed to update court specification');
        }
      }

      


      async delete_court_spec(id: string) {
        try {
          const court_spec = await this.prisma.court_Specs.findUnique({ where: { id } });
          if (!court_spec) {
            throw new NotFoundException(`Court specification with ID ${id} not found`);
          }
      
          return await this.prisma.court_Specs.delete({ where: { id } });
        } catch (error) {
          throw new InternalServerErrorException('Failed to delete court specification');
        }
      }
      
            


      async upsert_court_availability(id: string, dto: any) {
        try {
          const court = await this.prisma.court.findUnique({ where: { id } });
          if (!court) {
            throw new NotFoundException(`Court with ID ${id} not found`);
          }
      
          return await this.prisma.court_Availability.upsert({
            where: { court_id: id },
            update: dto,
            create: { court_id: id, ...dto },
          });
        } catch (error) {
          throw new InternalServerErrorException('Failed to update court availability');
        }
      }
    }      

            



