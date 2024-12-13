//court/court.service.ts

import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DAY, MEDIA_TYPE, Prisma } from '@prisma/client';
import { CourtDto, UpdateCourtDto } from 'src/court/dto/court.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CourtAvailabilityDto } from './dto/courtavailability.dto';
import { CourtMediaDto } from './dto/court_media.dto';
import { updateCourtAvailabilityDto } from './dto/updatecourtavailability.dto';
import { CreateCourtDto } from './dto/create-court.dto';
import { UploadService } from 'src/upload/upload.service';

@Injectable()
export class CourtService {
  constructor(private prisma: PrismaService, private uploadService: UploadService) {}


   mapMimeTypeToMediaType(mimetype: string): MEDIA_TYPE {
    switch (mimetype) {
      case 'image/jpeg':
      case 'image/png':
      case 'image/gif':
        return MEDIA_TYPE.image;
      case 'video/mp4':
      case 'video/quicktime':
      case 'video/mkv':
      case 'video/mpeg':
        return MEDIA_TYPE.video;
      default:
        throw new BadRequestException(`Unsupported media type: ${mimetype}`);
    }
  }


  // Centralized validation method
  private async validateCourtData(dto: CourtDto): Promise<void> {
    const { hourly_rate, min_down_payment } = dto;

    if (hourly_rate <= 0 || min_down_payment < 0) {
      throw new BadRequestException('Invalid hourly rate or down payment');
    }
  }
  
  
  private async createBaseCourt(courtData: CourtDto) {
    try {
      return await this.prisma.court.create({
        data: courtData,
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to create base court', error.message);
    }
  }
  
  private async addCourtMedia(courtId: string, files: Express.Multer.File[]) {
    if (!files?.length) return [];
    
    try {
      const uploadedFiles = await this.uploadService.uploadFiles(files);
      const media = uploadedFiles.map((file, index) => ({
        media_type: this.mapMimeTypeToMediaType(files[index].mimetype),
        media_link: file.filename,
      }));
  
      return await this.prisma.court_Media.createMany({
        data: media.map(m => ({ ...m, court_id: courtId })),
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to add court media', error.message);
    }
  }
  
  private async addCourtAvailability(courtId: string, availability: CourtAvailabilityDto[]) {
    if (!availability?.length) return [];
  
    try {
      return await this.prisma.court_Availability.createMany({
        data: availability.map(item => ({
          court_id: courtId,
          day: item.day,
          start_time: item.start_time,
          end_time: item.end_time,
        })),
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to add court availability', error.message);
    }
  }
  
  private async addCourtGames(courtId: string, gameIds: string[]) {
    if (!gameIds?.length) return [];
  
    try {
      return await this.prisma.courtGameLink.createMany({
        data: gameIds.map(gameId => ({
          court_id: courtId,
          game_id: gameId,
        })),
        skipDuplicates: true,
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to add court games', error.message);
    }
  }
  
  async createCourt(createCourtDto: CreateCourtDto, files: Express.Multer.File[]) {
    try {
      const { availability, games, ...courtData } = createCourtDto;
      
      // Convert string numbers to actual numbers
      courtData.hourly_rate = Number(courtData.hourly_rate);
      courtData.min_down_payment = Number(courtData.min_down_payment);
      
      // Validate court data
      await this.validateCourtData(courtData);
  
      // Use transaction to ensure all operations succeed or fail together
      const result = await this.prisma.$transaction(async (prisma) => {
        // Create base court
        const court = await this.createBaseCourt(courtData);
  
        // Add additional components in parallel if they exist
        await Promise.all([
          files?.length && this.addCourtMedia(court.id, files),
          availability?.length && this.addCourtAvailability(court.id, availability),
          games?.length && this.addCourtGames(court.id, games),
        ]);
  
        // Return complete court details
        return await prisma.court.findUnique({
          where: { id: court.id },
          include: {
            court_availability: true,
            court_media: true,
            game_links: {
              include: {
                game: true,
              },
            },
          },
        });
      });
  
      return result;
    } catch (error) {
      throw new InternalServerErrorException('Failed to create court', error.message);
    }
  }



  async get_all_Courts() {
    try {
      return this.prisma.court.findMany({
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to get courts',
        error.message,
      );
    }
  }

  async get_Courts() {
    try {
      return this.prisma.court.findMany({
        where: { is_deleted: false },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to get courts',
        error.message,
      );
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
          game_links: {
            include: {
              game: true,
            },
          },
        },
      });

      if (!court) {
        throw new NotFoundException(`Court with ID ${id} not found`);
      }

      return court;
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to retrieve court details',
        error.message,
      );
    }
  }

  async updateCourt(id: string, dto: CourtDto) {
    // this.validateCourtData(dto);

    try {
      const court = this.get_court_details(id);
      if (!court) {
        throw new NotFoundException(`Court with ID ${id} not found`);
      }

      return await this.prisma.court.update({
        where: { id },
        data: dto,
      });

    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Court with ID ${id} not found`);
        }
      }
      throw new InternalServerErrorException(
        'Failed to update court',
        error.message,
      );
    }
  }

  async deleteCourt(id: string){
    try {
      const court = await this.prisma.court.findUnique({ where: { id } });
      if (!court) {
        throw new NotFoundException(`Court with ID ${id} not found`);
      }

      await this.prisma.court.update({ 
        where: { id },
        data : { is_deleted: true }
      });
      // //delete availabilities , games , and other related tables  
      // // await this.prisma.court_Availability.deleteMany({ where: { court_id: id } });
      // // await this.prisma.courtGameLink.deleteMany({ where: { court_id: id } });
      // // await this.prisma.court_Media.deleteMany({ where: { court_id: id } });
      // // await this.prisma.court_Specs.deleteMany({ where: { court_id: id } });

      return 'Court deleted successfully';
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Court with ID ${id} not found`);
      }
      throw new InternalServerErrorException(
        'Failed to delete court',
        error.message,
      );
    }
  }

  async undeleteCourt(id: string){
    try {
      const court = await this.prisma.court.findUnique({ where: { id } });
      if (!court) {
        throw new NotFoundException(`Court with ID ${id} not found`);
      }

      await this.prisma.court.update({ 
        where: { id },
        data : { is_deleted: false }
      });
      return 'Court undeleted successfully';
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Court with ID ${id} not found`);
      }
      throw new InternalServerErrorException(
        'Failed to undelete court',
        error.message,
      );
    }
  }

  // async get_court_specs(court_id: string) {
  //   try {
  //     const court = await this.prisma.court.findUnique({
  //       where: { id: court_id },
  //     });
  //     if (!court) {
  //       throw new NotFoundException(`Court with ID ${court_id} not found`);
  //     }

  //     return await this.prisma.court_Specs.findMany({ where: { court_id } });
  //   } catch (error) {
  //     throw new InternalServerErrorException(
  //       'Failed to retrieve court specifications',
  //       error.message,
  //     );
  //   }
  // }

  // async add_court_spec(court_id: string, specsdto: CourtSpecDto) {
  //   try {
  //     const court = await this.prisma.court.findUnique({
  //       where: { id: court_id },
  //     });
  //     if (!court) {
  //       throw new NotFoundException(`Court with ID ${court_id} not found`);
  //     }

  //     return await this.prisma.court_Specs.create({
  //       data: {
  //         ...specsdto,
  //         court_id,
  //       },
  //     });
  //   } catch (error) {
  //     throw new InternalServerErrorException(
  //       'Failed to add court specification',
  //       error.message,
  //     );
  //   }
  // }

  // async update_court_spec(id: string, dto: CourtSpecDto) {
  //   try {
  //     const court_spec = await this.prisma.court_Specs.findUnique({
  //       where: { id },
  //     });
  //     if (!court_spec) {
  //       throw new NotFoundException(
  //         `Court specification with ID ${id} not found`,
  //       );
  //     }

  //     return await this.prisma.court_Specs.update({
  //       where: { id },
  //       data: dto,
  //     });
  //   } catch (error) {
  //     throw new InternalServerErrorException(
  //       'Failed to update court specification',
  //       error.message,
  //     );
  //   }
  // }

  // async delete_court_spec(id: string) {
  //   try {
  //     const court_spec = await this.prisma.court_Specs.findUnique({
  //       where: { id },
  //     });
  //     if (!court_spec) {
  //       throw new NotFoundException(
  //         `Court specification with ID ${id} not found`,
  //       );
  //     }

  //     return await this.prisma.court_Specs.delete({ where: { id } });
  //   } catch (error) {
  //     throw new InternalServerErrorException(
  //       'Failed to delete court specification',
  //       error.message,
  //     );
  //   }
  // }

  async updateCourtAvailability(id: string, dto: updateCourtAvailabilityDto) {
    const { start_time, end_time } = dto;

    if (start_time >= end_time) {
      throw new BadRequestException('Start time must be before end time');
    }

    try {
      const availability = await this.prisma.court_Availability.findUnique({
        where: { id },
      });
      if (!availability) {
        throw new NotFoundException(`Availability with ID ${id} not found`);
      }
      const { court_id, day } = availability;
      // Check for overlapping availabilities on the same day, excluding the current availability
      const overlappingAvailabilities = await this.prisma.court_Availability.findMany({
        where: {
          court_id,
          day,
          id: { not: id }, // Exclude current availability
          start_time: { lt: end_time },
          end_time: { gt: start_time },
        },
      });

      if (overlappingAvailabilities.length > 0) {
        throw new ConflictException(
          'Updated availability overlaps with an existing availability',
        );
      }

      // Update availability if no overlap
      return await this.prisma.court_Availability.update({
        where: { id },
        data: { court_id, day, start_time, end_time },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        error.message,
        'Failed to update court availability',
      );
    }
  }

  async get_court_availability(court_id: string) {
    try {
      return await this.prisma.court_Availability.findMany({
        where: { court_id },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to retrieve court availability',
        error.message,
      );
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

    const court = await this.prisma.court.findUnique({
      where: { id: court_id },
    });
    if (!court) {
      throw new NotFoundException(`Court with ID ${court_id} not found`);
    }
    try {
      // Check for overlapping availabilities on the same day
      const overlappingAvailabilities = await this.prisma.court_Availability.findMany({
        where: {
          court_id,
          day,
          start_time: { lt: end_time },
          end_time: { gt: start_time },
        },
      });

      if (overlappingAvailabilities.length > 0) {
        throw new ConflictException(
          'New availability overlaps with an existing availability',
        );
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
      throw new InternalServerErrorException(
        'Failed to create court availability',
        error.message,
      );
    }
  }

  // updateCourtMedia(id: string, dto: UpdateCourtMediaDto) {
  //   const { media_type, media_link } = dto;
  //   return this.prisma.court_Media.update({
  //     where: { id },
  //     data: {
  //       media_link,
  //       media_type,
  //     },
  //   });
  // }

  deleteCourtMedia(id: string) {
    try {
      return this.prisma.court_Media.delete({
        where: { id },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to delete court media',
        error.message,
      );
    }
  }

  getCourtMedia(court_id: string) {
    try {
      return this.prisma.court_Media.findMany({
        where: { court_id },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to retrieve court media',
        error.message,
      );
    }
  }
}
