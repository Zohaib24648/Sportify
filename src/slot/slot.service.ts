//slotservice.ts

import { Injectable } from '@nestjs/common';
import { CourtService } from 'src/court/court.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SlotService {
    constructor(private readonly prisma: PrismaService, private readonly courtService: CourtService ) {}



    async createSlot(dto: any) {
        const { court_id, start_time, end_time } = dto;
    
        // Convert times to Date objects
        const startTime = new Date(start_time);
        const endTime = new Date(end_time);
    
        // Step 1: Check for overlapping slots
        const overlappingSlot = await this.prisma.slot.findFirst({
            where: {
                court_id,
                OR: [
                    {
                        start_time: {
                            lt: endTime, // Existing slot starts before or during the new slot's end
                        },
                        end_time: {
                            gt: startTime, // Existing slot ends after or during the new slot's start
                        },
                    },
                ],
            },
        });
    
        if (overlappingSlot) {
            throw new Error(
                `Slot overlap detected for court ${court_id} between ${start_time} and ${end_time}`
            );
        }
    
        // Step 2: Create the slot if no overlap is found
        const slot = await this.prisma.slot.create({
            data: {
                court_id,
                start_time: startTime,
                end_time: endTime,
            },
        });
    
        return slot;
    }
    


    getSlots() {
        const slots = this.prisma.slot.findMany();
        return slots;
    }

    getSlotById(id: string) {
        const slot = this.prisma.slot.findUnique({ where: { id } });
        }

    updateSlot(id: any, dto: any) {
        const slot = this.prisma.slot.update({ where: { id },
             data: 
                { 
                    ...dto,            
            
            
            },
        });
    }

    deleteSlot(id: string) {
        const deletedSlot = this.prisma.slot.delete({ where: { id } });
    }
}
