//slotservice.ts

import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { SlotDto } from './dto/slot.dto';
import { CourtService } from 'src/court/court.service';
import { PrismaService } from 'src/prisma/prisma.service';
import e from 'express';
import { SlotCourtDto } from './dto/slotcourt.dto';
import { TimeDto } from './dto/time.dto';

@Injectable()
export class SlotService {
    constructor(private readonly prisma: PrismaService, private readonly courtService: CourtService ) {}


    timevalidator(dto: TimeDto) : boolean {
      const { start_time, end_time } = dto;
      if (start_time >= end_time) {
        console.error('Start time must be before end time');
        return false;
      }

      if (start_time < new Date()) {
        console.error('Start time must be in the future');
        return false;
      }
      if (end_time.getTime() - start_time.getTime() < 59 * 60 * 1000) {
        console.error('Slot must be atleast 60 mins');
        return false;
      }

      return true    
    } 

    async checkOverlappingSlot(dto: SlotDto): Promise<boolean> {
      try {
        const { court_id, start_time, end_time } = dto;
        const overlappingSlot = await this.prisma.slot.findFirst({
          where: {
            court_id,
            AND: [
              { start_time: { lt: end_time } },
              { end_time: { gt: start_time } },
            ],
          },
        });
    
        if (overlappingSlot) {
          console.error(
            `Slot overlap detected for court ${court_id} between ${start_time} and ${end_time}`
          );
          return false;
        }
    
        return true;
      } catch (error) {
        console.error('Failed to check overlapping slot', error.message);
        throw new BadRequestException('Failed to check overlapping slot', error.message);
      }
    }
    
    async checkCourtAvailability(dto: SlotDto): Promise<boolean> {
      const { court_id, start_time, end_time } = dto;
    
      try {
        const courtAvailability = await this.prisma.court_Availability.findUnique({
          where: { court_id },
        });
    
        if (!courtAvailability) {
          console.error(`Court availability not set for court ${court_id}`);
          return false;
        }
    
        let currentStartTime = start_time;
        let currentEndTime = end_time;
    
        while (currentStartTime < currentEndTime) {
          const dayOfWeek = currentStartTime.getUTCDay(); // 0 = Sunday, 6 = Saturday
    
          if (!courtAvailability.Day_of_week[dayOfWeek]) {
            console.error(
              `Court is not available on ${currentStartTime.toDateString()}`
            );
            return false;
          }
    
          const availabilityStart = this.combineDateTime(
            currentStartTime,
            courtAvailability.start_time
          );
          const availabilityEnd = this.combineDateTime(
            currentStartTime,
            courtAvailability.end_time
          );
    
          const segmentEnd = new Date(
            Math.min(
              currentEndTime.getTime(),
              availabilityEnd.getTime()
            )
          );
    
          if (currentStartTime < availabilityStart || segmentEnd > availabilityEnd) {
            console.log(currentStartTime, segmentEnd, availabilityStart, availabilityEnd);
            console.error(
              `Slot time ${currentStartTime} - ${segmentEnd} is outside court's availability hours`
            );
            return false;
          }
    
          // Move to the next day
          currentStartTime = new Date(currentStartTime);
          currentStartTime.setUTCDate(currentStartTime.getUTCDate() + 1);
          currentStartTime.setUTCHours(0, 0, 0, 0);
        }
    
        return true; // Slot is valid
      } catch (error) {
        console.error('Error checking court availability', error.message);
        throw new BadRequestException('Failed to check court availability', error.message);
      }
    }
    
    
    
    async checkCourtCloseDates(dto: SlotDto): Promise<boolean> {
      try {
        const { court_id, start_time, end_time } = dto;
    
        const overlappingCloseDate = await this.prisma.court_Close_Dates.findFirst({
          where: {
            court_id,
            AND: [
              { start_date: { lt: end_time } },
              { end_date: { gt: start_time } },
            ],
          },
        });
    
        if (overlappingCloseDate) {
          console.error(
            `Court is closed during the requested slot time from ${overlappingCloseDate.start_date} to ${overlappingCloseDate.end_date}`
          );
          return false;
        }
    
        return true;
      } catch (error) {
        console.error('Failed to check court close dates', error.message);
        throw new BadRequestException('Failed to check court close dates', error.message);
      }
    }

    



      async createSlot(dto : SlotDto) {
        try {
          const { court_id, start_time, end_time } = dto;
          if (!this.timevalidator(dto)) {
            throw new BadRequestException('Invalid time slot');
          }

          const isSlotOverlapping = await this.checkOverlappingSlot(dto);
          const isCourtAvailable = await this.checkCourtAvailability(dto);
          const isCourtOpen = await this.checkCourtCloseDates(dto);
      
          if (!isSlotOverlapping || !isCourtAvailable || !isCourtOpen) {
            throw new BadRequestException('Failed slot creation due to validation errors');
          }
      
        const slot =  await this.prisma.slot.create({
          data: { court_id, start_time: start_time, end_time: end_time },
        });

        return slot;
        } catch (error) {
          
          throw new BadRequestException('Failed to create slot', error.message);
        }
      }


      
      async updateSlot(slot_id: string, dto: SlotDto) {
        if (!this.timevalidator(dto)) {
          throw new BadRequestException('Invalid time slot');
        }
       try {
        const isSlotOverlapping = await this.checkOverlappingSlot(dto);
        const isCourtAvailable = await this.checkCourtAvailability(dto);
        const isCourtOpen = await this.checkCourtCloseDates(dto);

      if (!isSlotOverlapping || !isCourtAvailable || !isCourtOpen) {
      throw new BadRequestException('Failed slot updation due to validation errors');
      }
      
        return await this.prisma.slot.update({
          where: { id: slot_id },
          data: { ...dto },
        });
       } catch (error) {
        
        throw new BadRequestException('Failed to update slot', error.message);
       }
      }
      

    getSlots() {
      try {
        return this.prisma.slot.findMany();
      } catch (error) {
        
        throw new BadRequestException('Failed to fetch slots', error.message);
      }
    }

    getSlotById(id: string) {
      try {
        return this.prisma.slot.findUnique({ where: { id } });
      } catch (error) {
          
          throw new BadRequestException('Failed to fetch slot by id', error.message);
        }

    }

    
    getSlotsByCourtId(court_id: string) {
        try {
            return this.prisma.slot.findMany({ where: { court_id } });
        }
        catch (error) {
            throw new BadRequestException('Failed to fetch slots by court id', error.message);
        }
    }

    getSlotsByDate(dto: any) {
        const { date } = dto;
        const slots = this.prisma.slot.findMany({ where: { end_time: { gte: date } } }); 
        return slots;
    }

    getSlotsByCourtIdAndDate(dto : SlotCourtDto) {
        const { court_id, date } = dto;
        console.log(court_id, date);
        const slots = this.prisma.slot.findMany({ where: { court_id, end_time: { gte: date } } });
        return slots;
    }




    async deleteSlot(id: string) {
      try {
        await this.prisma.slot.delete({ where: { id } });
      } catch (error) {
        throw new BadRequestException('Failed to delete slot', error.message);
      }
    }

//   async getAvailableSlotsForDay(dto: any) {
//   const { court_id, date } = dto;
//   // Parse the date into a start and end of day (UTC)
//   const inputDate = new Date(date);
//   const startOfDay = new Date(inputDate);
//   startOfDay.setUTCHours(0, 0, 0, 0);

//   const endOfDay = new Date(inputDate);
//   endOfDay.setUTCHours(23, 59, 59, 999);

//   // Step 1: Fetch court availability
//   const courtAvailability = await this.prisma.court_Availability.findUnique({
//     where: { court_id: court_id },
//   });

//   if (!courtAvailability) {
//     throw new NotFoundException(`Court availability not set for court ${court_id}`);
//   }

//   const dayOfWeek = startOfDay.getUTCDay();
//   if (!courtAvailability.Day_of_week[dayOfWeek]) {
//     throw new BadRequestException(`Court is not available on ${startOfDay.toUTCString()}`);
//   }

//   // Calculate the start and end of availability for this day
//   const availabilityStart = this.combineDateTime(startOfDay, courtAvailability.start_time);
//   const availabilityEnd = this.combineDateTime(startOfDay, courtAvailability.end_time);

//   // Step 2: Fetch already booked slots for this court on the given day
//   const bookedSlots = await this.prisma.slot.findMany({
//     where: {
//       court_id: court_id,
//       start_time: { gte: availabilityStart },
//       end_time: { lte: availabilityEnd },
//     },
//     orderBy: { start_time: 'asc' },
//   });

//   // Step 3: Generate all possible slots based on availability
//   const availableSlots = [];
//   let currentStart = availabilityStart;

//   for (const bookedSlot of bookedSlots) {
//     // Add free time between `currentStart` and the start of the next booked slot
//     if (currentStart < bookedSlot.start_time) {
//       availableSlots.push({
//         start_time: currentStart,
//         end_time: bookedSlot.start_time,
//       });
//     }
//     // Update `currentStart` to the end of the current booked slot
//     currentStart = bookedSlot.end_time;
//   }

//   // Add remaining time after the last booked slot
//   if (currentStart < availabilityEnd) {
//     availableSlots.push({
//       start_time: currentStart,
//       end_time: availabilityEnd,
//     });
//   }

//   return availableSlots;
// }

// Utility function to combine date and time
private combineDateTime(date: Date, time: Date): Date {
  const combined = new Date(date);
  combined.setUTCHours(time.getUTCHours(), time.getUTCMinutes(), 0, 0);
  return combined;
}


}
