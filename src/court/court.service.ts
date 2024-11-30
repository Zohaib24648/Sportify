//court/court.service.ts

import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { DAY,MEDIA_TYPE, Prisma } from '@prisma/client';
import { CourtDto } from '../court/dto/court.dto';
import { CourtSpecDto } from '../court/dto/court_spec.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CourtAvailabilityDto } from './dto/courtavailability.dto';
import { CourtMediaDto } from './dto/court_media.dto';
import { updateCourtAvailabilityDto } from './dto/updatecourtavailability.dto';


@Injectable()
export class CourtService {

    constructor (private  prisma:PrismaService ){}


    
    // Centralized validation method
    private async validateCourtData(dto: CourtDto): Promise<void> {
      const {hourly_rate, min_down_payment } = dto;

      if (hourly_rate <= 0 || min_down_payment < 0) {
          throw new BadRequestException('Invalid hourly rate or down payment');
      }
  }
    
    async createCourt(dto: CourtDto) {
        const { name} = dto;
      
        this.validateCourtData(dto);
      
        try {
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
        catch (error) {
          if (error instanceof ConflictException) {
            throw error;
          }


          throw new InternalServerErrorException('Failed to create court',error.message);
        }
      }


      

    async get_Courts(){
      try {
        return this.prisma.court.findMany();      
      } catch (error) {
        throw new InternalServerErrorException('Failed to get courts',error.message);        
      }
    }



    async get_court_details(id: string) {
        try {
          const court = await this.prisma.court.findUnique({
            where: { id },
            include: {
              court_specs: true,
              court_availability: true,
              court_media: true,
              game_types: {
                include: {
                  game_type: true
              }},
            },
          });
      
          if (!court) {
            throw new NotFoundException(`Court with ID ${id} not found`);
          }
      
          return court;
        } catch (error) {
          throw new InternalServerErrorException('Failed to retrieve court details',error.message);
        }
      }
      

    async updateCourt(id: string, dto: CourtDto) {
      this.validateCourtData(dto);

        try {
            const updatedCourt = await this.prisma.court.update({
                where: {
                    id: id,
                },
                data: {
                    ...dto,
                },
            });
            return updatedCourt;
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
              if (error.code === 'P2025') {
                throw new NotFoundException(`Court with ID ${id} not found`);
              }
            }
            throw new InternalServerErrorException('Failed to update court',error.message);
          }
    }
    
    
    //Not Correct

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
          throw new InternalServerErrorException('Failed to delete court',error.message);
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
          throw new InternalServerErrorException('Failed to retrieve court specifications',error.message);
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
          throw new InternalServerErrorException('Failed to add court specification',error.message);
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
          throw new InternalServerErrorException('Failed to update court specification',error.message);
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
          throw new InternalServerErrorException('Failed to delete court specification',error.message);
        }
      }
      
            


      async updateCourtAvailability(id: string, dto: updateCourtAvailabilityDto) {
        const { start_time, end_time } = dto;
      

        if (start_time >= end_time) {
          throw new BadRequestException('Start time must be before end time');
        }
      
        try {
          const availability = await this.prisma.court_Availability.findUnique({ where: { id } });
          if (!availability) {
            throw new NotFoundException(`Availability with ID ${id} not found`);
          }
          const { court_id,day } = availability;
          // Check for overlapping availabilities on the same day, excluding the current availability
          const overlappingAvailabilities = await this.prisma.court_Availability.findMany({
            where: {
              court_id,
              day,
              id: { not: id }, // Exclude the current availability
              OR: [
                {
                  start_time: { lt: end_time },
                  end_time: { gt: start_time },
                },
              ],
            },
          });
      
          if (overlappingAvailabilities.length > 0) {
            throw new ConflictException('Updated availability overlaps with an existing availability');
          }
      
          // Update availability if no overlap
          return await this.prisma.court_Availability.update({
            where: { id },
            data: { court_id, day, start_time, end_time },
          });
        } catch (error) {
          throw new InternalServerErrorException('Failed to update court availability', error.message);
        }
      }
      
      
      async get_court_availability(court_id: string) {
        try {
            return await this.prisma.court_Availability.findMany({
                where: { court_id },
            });
        } catch (error) {
            throw new InternalServerErrorException('Failed to retrieve court availability', error.message);
        }
    }
    

    async createCourtAvailability(court_id: string, dto: CourtAvailabilityDto) {
      const { day, start_time, end_time } = dto;

      // Validate day, start_time, and end_time
      if (!Object.values(DAY).includes(day)) {
        throw new BadRequestException(`Invalid day: ${day}`);
      }

    
      if (start_time >= end_time) {
        throw new BadRequestException('Start time must be before end time');
      }
    
      const court = await this.prisma.court.findUnique({ where: { id: court_id } });
      if (!court) {
        throw new NotFoundException(`Court with ID ${court_id} not found`);
      }
      try {
        // Check for overlapping availabilities on the same day
        const overlappingAvailabilities = await this.prisma.court_Availability.findMany({
          where: {
            court_id,
            day,
            OR: [
              {
                start_time: { lt: end_time },
                end_time: { gt: start_time },
              },
            ],
          },
        });
    
        if (overlappingAvailabilities.length > 0) {
          throw new ConflictException('New availability overlaps with an existing availability');
        }
    
        // Create new availability if no overlap
        return await this.prisma.court_Availability.create({
          data: {
            court_id,
            day,
            start_time,
            end_time,
          },
        });
      } catch (error) {
        if (error instanceof ConflictException) {
          throw error;
        }
        throw new InternalServerErrorException('Failed to create court availability', error.message);
      }
    }
    



    addCourtMedia(dto : CourtMediaDto) {
      const { court_id, media_type, media_link } = dto;
      return this.prisma.court_Media.create({
        data: {
          court_id,
          media_link,
          media_type,
        },
      });

    }

    deleteCourtMedia(id: string) {
      try {
        return this.prisma.court_Media.delete({
          where: { id },
        });
      }
       catch (error) {
        throw new InternalServerErrorException('Failed to delete court media', error.message);
      }
  }

    getCourtMedia(court_id: string) {
      try {
        return this.prisma.court_Media.findMany({
          where: { court_id },
        });
      } catch (error) {
        throw new InternalServerErrorException('Failed to retrieve court media', error.message);
      }
    }
}


            


