import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { SignupDto } from 'src/auth/dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/guard/roles.decorator';
import { UpdateUserDto } from './dto/updateuser.dto';
import { ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TimeDto } from 'src/slot/dto/time.dto';

@Controller('admin')
export class AdminController {
  constructor(private admin_service: AdminService) {}

  @ApiOperation({ summary: 'Create a new user (Admin Only)' })
  @ApiBearerAuth()
  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post('create_user')
  createUser(@Body() dto: SignupDto) {
    return this.admin_service.createUser(dto);
  }

  @ApiOperation({ summary: 'update an existing user(Admin Only)' })
  @ApiBearerAuth()
  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Put('update_user/:id')
  updateUser(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.admin_service.updateUser(id, dto);
  }

  @ApiOperation({ summary: 'delete a  user (Admin Only)' })
  @ApiBearerAuth()
  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Delete('delete_user/:id')
  deleteUser(@Param('id') id: string) {
    return this.admin_service.deleteUser(id);
  }

  @ApiOperation({ summary: 'Retrieve a list of users (Admin Only)' })
  @ApiBearerAuth()
  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get('get_users')
  getUser() {
    return this.admin_service.getUsers();
  }

  @ApiOperation({ summary: 'Retrieve Dashboard Data (Admin Only)' })
  @ApiBearerAuth()
  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post('dashboard')
  getdashboard(@Body() dto: TimeDto) {
    return this.admin_service.getDashboardData(dto);
  }
}
