//user/user.controller.ts
import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserSearchDto } from './dto/usersearch.dto';
import { UserService } from './user.service';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('users')
export class UserController {
    constructor (private readonly userService: UserService) {}

    @Get('search')
  async searchUsers(@Query() dto: UserSearchDto) {
    return this.userService.searchUsers(dto);

   


  }
  @ApiBearerAuth()
  @Get('me')      
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  async getMe(@Req() req) {
    const dto = req.user;
    return this.userService.getMe(dto);
       
  }

  @ApiBearerAuth()
  @Get('bookingHistory')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  async getBookingHistory(@Req() req) {
    const dto = req.user;
    return this.userService.getBookingHistory(dto);
  }
  
  @ApiBearerAuth()
  @Get('paymentHistory')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  async getPaymentHistory(@Req() req) {
    const dto = req.user;
    return this.userService.getPaymentHistory(dto);
  }

}
