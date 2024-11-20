//slotservice.ts

import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { SlotDto } from './dto/slot.dto';
import { CourtService } from 'src/court/court.service';
import { PrismaService } from 'src/prisma/prisma.service';
import e from 'express';
import { SlotCourtDto } from './dto/slotcourt.dto';

@Injectable()
export class SlotService {
    constructor(private readonly prisma: PrismaService, private readonly courtService: CourtService ) {}


    async checkOverlappingSlot(dto : SlotDto) {
        const {court_id, start_time, end_time} = dto;

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
          throw new Error(
            `Slot overlap detected for court ${court_id} between ${start_time} and ${end_time}`
          );
        }
      }
    
      async checkCourtAvailability(dto: SlotDto) {
        const {court_id, start_time, end_time} = dto;
        
        const courtAvailability = await this.prisma.court_Availability.findUnique({
          where: { court_id },
        });
    
        if (!courtAvailability) {
          throw new Error(`Court availability not set for court ${court_id}`);
        }
    
        const dayOfWeek = start_time.getUTCDay();
        if (!courtAvailability.Day_of_week[dayOfWeek]) {
          throw new Error(`Court is not available on ${start_time.toDateString()}`);
        }
    
        const availabilityStart = this.combineDateTime(start_time, courtAvailability.start_time);
        const availabilityEnd = this.combineDateTime(start_time, courtAvailability.end_time);
    
        if (start_time < availabilityStart || end_time > availabilityEnd) {
          throw new Error(
            `Slot time ${start_time} - ${end_time} is outside court's availability hours`
          );
        }
      }
    
      async checkCourtCloseDates(dto: SlotDto) {
        const {court_id, start_time, end_time} = dto;
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
          throw new Error(
            `Court is closed during the requested slot time from ${overlappingCloseDate.start_date} to ${overlappingCloseDate.end_date}`
          );
        }
      }
    
   



      async createSlot(dto : SlotDto) {
        const { court_id, start_time, end_time } = dto;
      
        await this.checkOverlappingSlot(dto);
        await this.checkCourtAvailability(dto);
        await this.checkCourtCloseDates(dto);
      
        const slot =  await this.prisma.slot.create({
          data: { court_id, start_time: start_time, end_time: end_time },
        });

        return slot;
      }


      
      async updateSlot(slot_id: string, dto: SlotDto) {
        const { court_id, start_time, end_time } = dto;      
        await this.checkOverlappingSlot(dto);
        await this.checkCourtAvailability(dto);
        await this.checkCourtCloseDates(dto);
      
        return await this.prisma.slot.update({
          where: { id: slot_id },
          data: { ...dto },
        });
      }
      

    getSlots() {
        const slots = this.prisma.slot.findMany();
        return slots;
    }

    getSlotById(id: string) {
        const slot = this.prisma.slot.findUnique({ where: { id } });
    }

    
    getSlotsByCourtId(court_id: string) {
        const slots = this.prisma.slot.findMany({ where: { court_id } });
        return slots
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




    deleteSlot(id: string) {
        const deletedSlot = this.prisma.slot.delete({ where: { id } });
    }

    async getAvailableSlotsForDay(dto: any) {
        const { court_id, date } = dto;
  // Parse the date into a start and end of day (UTC)
  const inputDate = new Date(date);
  const startOfDay = new Date(inputDate);
  startOfDay.setUTCHours(0, 0, 0, 0);

  const endOfDay = new Date(inputDate);
  endOfDay.setUTCHours(23, 59, 59, 999);

  // Step 1: Fetch court availability
  const courtAvailability = await this.prisma.court_Availability.findUnique({
    where: { court_id: court_id },
  });

  if (!courtAvailability) {
    throw new NotFoundException(`Court availability not set for court ${court_id}`);
  }

  const dayOfWeek = startOfDay.getUTCDay();
  if (!courtAvailability.Day_of_week[dayOfWeek]) {
    throw new BadRequestException(`Court is not available on ${startOfDay.toUTCString()}`);
  }

  // Calculate the start and end of availability for this day
  const availabilityStart = this.combineDateTime(startOfDay, courtAvailability.start_time);
  const availabilityEnd = this.combineDateTime(startOfDay, courtAvailability.end_time);

  // Step 2: Fetch already booked slots for this court on the given day
  const bookedSlots = await this.prisma.slot.findMany({
    where: {
      court_id: court_id,
      start_time: { gte: availabilityStart },
      end_time: { lte: availabilityEnd },
    },
    orderBy: { start_time: 'asc' },
  });

  // Step 3: Generate all possible slots based on availability
  const availableSlots = [];
  let currentStart = availabilityStart;

  for (const bookedSlot of bookedSlots) {
    // Add free time between `currentStart` and the start of the next booked slot
    if (currentStart < bookedSlot.start_time) {
      availableSlots.push({
        start_time: currentStart,
        end_time: bookedSlot.start_time,
      });
    }
    // Update `currentStart` to the end of the current booked slot
    currentStart = bookedSlot.end_time;
  }

  // Add remaining time after the last booked slot
  if (currentStart < availabilityEnd) {
    availableSlots.push({
      start_time: currentStart,
      end_time: availabilityEnd,
    });
  }

  return availableSlots;
}

// Utility function to combine date and time
private combineDateTime(date: Date, time: Date): Date {
  const combined = new Date(date);
  combined.setUTCHours(time.getUTCHours(), time.getUTCMinutes(), 0, 0);
  return combined;
}


}
