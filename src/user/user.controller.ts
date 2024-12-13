//user/user.controller.ts
import { Body, Controller, Get, Post, Put, Query, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserSearchDto } from './dto/usersearch.dto';
import { UserService } from './user.service';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { UpdateUserDto } from './dto/updateuser.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

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
  @Put('update_user')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
@UseInterceptors(FileInterceptor('user_pfp_link'))
  async updateUser(@Req() req , @Body() dto1 : UpdateUserDto , @UploadedFile() dto2: Express.Multer.File ) {
    const dto = req.user;
    return this.userService.updateUser(dto,dto1,dto2);
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
