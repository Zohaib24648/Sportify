//src/slot/slot.controller.ts
import { Body, Controller, Get, Post } from '@nestjs/common';
import { Roles } from 'src/auth/guard/roles.decorator';
import { SlotService } from './slot.service';
import { SlotCourtDto } from './dto/slotcourt.dto';


@Controller('slot')
export class SlotController {
    constructor (private readonly slotService: SlotService) {}

    @Roles('admin')
    @Post('get_available_slots')
    getAvailableSlotsForDay(@Body() dto : any){
        return this.slotService.getAvailableSlotsForDay(dto);
    
    
    }

    @Roles('admin')
    @Get('get_slots')
    getSlots() {
      return this.slotService.getSlots();
    }
    

}
