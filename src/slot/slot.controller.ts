//src/slot/slot.controller.ts
import { Body, Controller, Get, Post } from '@nestjs/common';
import { Roles } from 'src/auth/guard/roles.decorator';
import { SlotService } from './slot.service';
import { SlotCourtDto } from './dto/slotcourt.dto';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SlotDto } from './dto/slot.dto';
import { TimeDto } from './dto/time.dto';

@ApiTags('slot')
@Controller('slot')
export class SlotController {
  constructor(private readonly slotService: SlotService) {}

  @ApiResponse({
    status: 200,
    description: 'List of available slots for the given court and date',
    type: [TimeDto],
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: 404,
    description: 'No available slots found for the given court and date',
  })
  @ApiBearerAuth()
  @Roles('admin')
  @Post('get_available_slots')
  getAvailableSlotsForDay(@Body() dto: any) {
    return this.slotService.getAvailableSlotsForDay(dto);
  }

  @ApiResponse({
    status: 200,
    description: 'Get all slots',
    type: [SlotDto],
  })
  @ApiBearerAuth()
  @Roles('admin')
  @Get('get_slots')
  getSlots() {
    return this.slotService.getSlots();
  }
}
