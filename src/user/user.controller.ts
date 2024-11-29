//user/user.controller.ts
import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserSearchDto } from './dto/usersearch.dto';
import { UserService } from './user.service';
import { RolesGuard } from 'src/auth/guard/roles.guard';

@Controller('users')
export class UserController {
    constructor (private readonly userService: UserService) {}

    @Get('search')
  async searchUsers(@Query() dto: UserSearchDto) {
    return this.userService.searchUsers(dto);

   


  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  async getMe(@Req() req) {
    const dto = req.user;
    return this.userService.getMe(dto);
       
  }

}
