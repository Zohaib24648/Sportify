//src/slot/slot.controller.ts
import { Body, Controller, Get, Post } from '@nestjs/common';
import { Roles } from 'src/auth/guard/roles.decorator';
import { SlotService } from './slot.service';
import { SlotCourtDto } from './dto/slotcourt.dto';


@Controller('slot')
export class SlotController {
    constructor (private readonly slotService: SlotService) {}

    @Roles('admin')
    @Post('get_slots')
    getAvailableSlotsForDay(@Body() dto : any){
        return this.slotService.getAvailableSlotsForDay(dto);
    }
    

    @Roles('admin')
    @Post('get_slots_by_court')
    getAvailableSlotsForCourt(@Body() dto : any){
        return this.slotService.getSlotsByCourtId(dto);
    }

    @Roles('admin')
    @Post('get_slots_by_day')
    getBookedSlotsForDay(@Body() dto : any){
        return this.slotService.getSlotsByDate(dto);
    }

    @Roles('admin')
    @Post('get_slots_court_day')
    getBookedSlotsForCourtDay(@Body() dto : SlotCourtDto){
        return this.slotService.getSlotsByDate(dto);
    }
    
}
