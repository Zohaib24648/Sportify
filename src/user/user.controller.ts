//user/user.controller.ts
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserSearchDto } from './dto/usersearch.dto';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
    constructor (private readonly userService: UserService) {}

    @Get('search')
  async searchUsers(@Query() dto: UserSearchDto) {
    return this.userService.searchUsers(dto);
  }

}
