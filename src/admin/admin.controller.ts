import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { SignupDto } from 'src/auth/dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/guard/roles.decorator';
import { UpdateUserDto } from './dto/updateuser.dto';

@Controller('admin')
export class AdminController {
constructor (private admin_service: AdminService) {}

@Roles('admin')
@UseGuards(AuthGuard('jwt'),RolesGuard)
@Post('create_user')
createUser(@Body() dto: SignupDto) {
    return this.admin_service.createUser(dto);}


    @Roles('admin')
    @UseGuards(AuthGuard('jwt'),RolesGuard)
    @Put('update_user/:id')
    updateUser(@Param('id') id:string , @Body() dto: UpdateUserDto) {
        return this.admin_service.updateUser(id, dto);}
    


        @Roles('admin')
        @UseGuards(AuthGuard('jwt'),RolesGuard)
        @Delete('delete_user/:id')
        deleteUser(@Param('id') id:string) {
            return this.admin_service.deleteUser(id);}
        

            @Roles('admin')
            @UseGuards(AuthGuard('jwt'),RolesGuard)
            @Get('get_users')
            getUser() {
                return this.admin_service.getUsers();}
            

}



