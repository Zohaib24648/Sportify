//court/court.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CourtService } from './court.service';
import { CourtDto } from 'src/court/dto/court.dto';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/auth/guard/roles.decorator';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { ROLE } from '@prisma/client';
import { CourtSpecDto } from 'src/court/dto/court_spec.dto';
import { CourtAvailabilityDto } from './dto/courtavailability.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CourtMediaDto } from './dto/court_media.dto';
import { updateCourtAvailabilityDto } from './dto/updatecourtavailability.dto';
import { UpdateCourtMediaDto } from './dto/update_court_media.dto';
import { PaginationDto } from 'src/booking/dto/pagination.dto';
import { CreateCourtDto } from './dto/create-court.dto';
import { FilesInterceptor } from '@nestjs/platform-express';

@ApiTags('Courts')
@Controller('court')
export class CourtController {
  constructor(private court_service: CourtService) {}

  //Create Court
  @ApiOperation({ summary: 'Create a new court' })
  @ApiResponse({ status: 400, description: 'Request data error , ' })
  @ApiResponse({ status: 500, description: 'Undefined Error , ' })
  @ApiResponse({ status: 201, description: 'Court successfully created' })
  @ApiResponse({
    status: 409,
    description: 'Court with this name already exists',
  })
  @UseInterceptors(FilesInterceptor('files'))
  @ApiBearerAuth()
  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post('create_court')
  createCourt(@Body() dto: CreateCourtDto, @UploadedFiles() files: Express.Multer.File[]) {
    console.log(dto);
    return this.court_service.createCourt(dto, files);
  }

  @ApiOperation({ summary: 'Retrieve a list of courts excluding deleted' })
  @ApiResponse({ status: 200, description: 'List of courts' })
  @ApiResponse({ status: 404, description: 'No courts found' })
  @ApiResponse({ status: 500, description: 'Undefined Error' })
  @ApiBearerAuth()
  //Get Courts
  @Get('get_courts')
  getCourts() {
    return this.court_service.get_Courts();
  }


  @ApiOperation({ summary: 'Retrieve a list of courts including deleted' })
  @ApiResponse({ status: 200, description: 'List of courts' })
  @ApiResponse({ status: 404, description: 'No courts found' })
  @ApiResponse({ status: 500, description: 'Undefined Error' })
  @ApiBearerAuth()
  //Get Courts
  @Roles('admin')
  @UseGuards(AuthGuard('jwt'))
  @Get('get_all_courts')
  getAllCourts() {
    return this.court_service.get_all_Courts();
  }


  @ApiOperation({ summary: 'Update a court by ID' })
  @ApiResponse({ status: 200, description: 'Court updated successfully' })
  @ApiResponse({ status: 400, description: 'Request data error' })
  @ApiResponse({ status: 404, description: 'Court not found' })
  @ApiResponse({ status: 500, description: 'Undefined Error' })
  @ApiBearerAuth()
  //Update Court
  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Put('update_court/:id')
  updateCourt(@Param('id') id: string, @Body() dto: CourtDto) {
    return this.court_service.updateCourt(id, dto);
  }

  //create Court Availability
  @ApiOperation({ summary: 'Create availability for a court' })
  @ApiResponse({ status: 400, description: 'Request data error' })
  @ApiResponse({
    status: 201,
    description: 'Court availability created successfully',
  })
  @ApiResponse({ status: 404, description: 'Court not found' })
  @ApiResponse({
    status: 409,
    description: 'Availability overlaps with an existing one',
  })
  @ApiResponse({ status: 500, description: 'Undefined Error' })
  @ApiBearerAuth()
  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post('create_court_availability/:id')
  createCourtAvailability(
    @Param('id') id: string,
    @Body() dto: CourtAvailabilityDto,
  ) {
    return this.court_service.createCourtAvailability(id, dto);
  }
  //get Court Availability
  @ApiOperation({ summary: 'Get the availability of a specific court' })
  @ApiResponse({
    status: 200,
    description: 'Court availability retrieved successfully',
  })
  @ApiResponse({ status: 500, description: 'Undefined Error' })
  @ApiBearerAuth()
  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get('get_court_availability/:id')
  get_court_availability(@Param('id') id: string) {
    return this.court_service.get_court_availability(id);
  }

  //Update Court Availability
  @ApiOperation({ summary: 'Update availability for a court' })
  @ApiOperation({ summary: 'Update availability for a court' })
  @ApiResponse({
    status: 200,
    description: 'Court availability updated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request: Invalid day or time range',
  })
  @ApiResponse({ status: 404, description: 'Court availability not found' })
  @ApiResponse({
    status: 409,
    description: 'Availability overlaps with an existing one',
  })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @ApiBearerAuth()
  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Put('update_court_availability/:id')
  updateCourtAvailability(
    @Param('id') id: string,
    @Body() dto: updateCourtAvailabilityDto,
  ) {
    return this.court_service.updateCourtAvailability(id, dto);
  }

  //Delete Court
  @ApiOperation({ summary: 'Delete a court by ID' })
  @ApiResponse({ status: 200, description: 'Court deleted successfully' })
  @ApiResponse({ status: 404, description: 'Court not found' })
  @ApiBearerAuth()
  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Delete('delete_court/:id')
  deleteCourt(@Param('id') id: string) {
    return this.court_service.deleteCourt(id);
  }

    //UnDelete Court
    @ApiOperation({ summary: 'UnDelete a court by ID' })
    @ApiResponse({ status: 200, description: 'Court undeleted successfully' })
    @ApiResponse({ status: 404, description: 'Court not found' })
    @ApiBearerAuth()
    @Roles('admin')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Delete('undelete_court/:id')
    undeleteCourt(@Param('id') id: string) {
      return this.court_service.undeleteCourt(id);
    }


  //Get Court Details
  @ApiOperation({ summary: 'Get details of a specific court by ID' })
  @ApiResponse({
    status: 200,
    description: 'Court details retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Court not found' })
  @ApiResponse({ status: 500, description: 'Undefined Error' })
  @Get('get_court_details/:id')
  get_court_details(@Param('id') id: string) {
    return this.court_service.get_court_details(id);
  }

  // // Add Court Specs
  // @ApiOperation({ summary: 'Add specifications to a court' })
  // @ApiResponse({
  //   status: 201,
  //   description: 'Court specifications added successfully',
  // })
  // @ApiResponse({ status: 404, description: 'Court not found' })
  // @ApiBearerAuth()
  // @Roles('admin')
  // @UseGuards(AuthGuard('jwt'), RolesGuard)
  // @Post('add_court_specs/:id')
  // add_court_specs(@Param('id') id: string, @Body() dto: CourtSpecDto) {
  //   return this.court_service.add_court_spec(id, dto);
  // }

  // //Get Court Specs
  // @ApiOperation({ summary: 'Retrieve specifications of a specific court' })
  // @ApiResponse({ status: 200, description: 'List of court specifications' })
  // @ApiResponse({ status: 404, description: 'Court not found' })
  // @ApiBearerAuth()
  // @UseGuards(AuthGuard('jwt'))
  // @Get('get_court_specs/:id')
  // get_court_specs(@Param('id') id: string) {
  //   return this.court_service.get_court_specs(id);
  // }

  // //Delete Court Specs
  // @ApiOperation({ summary: 'Delete a court specification by ID' })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Court specification deleted successfully',
  // })
  // @ApiResponse({ status: 404, description: 'Court specification not found' })
  // @ApiBearerAuth()
  // @Roles('admin')
  // @UseGuards(AuthGuard('jwt'))
  // @Delete('delete_court_spec/:id')
  // delete_court_spec(@Param('id') id: string) {
  //   return this.court_service.delete_court_spec(id);
  // }

  // // Update Court Specs
  // @ApiOperation({ summary: 'Update a court specification by ID' })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Court specification updated successfully',
  // })
  // @ApiResponse({ status: 404, description: 'Court specification not found' })
  // @ApiBearerAuth()
  // @Roles('admin')
  // @UseGuards(AuthGuard('jwt'), RolesGuard)
  // @Post('update_court_specs/:id')
  // update_court_specs(@Param('id') id: string, @Body() dto: CourtSpecDto) {
  //   return this.court_service.update_court_spec(id, dto);
  // }

  // @ApiOperation({ summary: 'Add media to a court' })
  // @ApiBearerAuth()
  // @Roles('admin')
  // @UseGuards(AuthGuard('jwt'), RolesGuard)
  // @Post('add_court_media/:id')
  // add_court_media(@Param('id') id: string , @Body() dto: CourtMediaDto) {
  //   return this.court_service.addCourtMedia(id,dto);
  // }

  @ApiOperation({ summary: 'deletes media from a court' })
  @ApiBearerAuth()
  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Delete('delete_court_media/:id')
  delete_court_media(@Param('id') id: string) {
    return this.court_service.deleteCourtMedia(id);
  }

  @ApiOperation({ summary: 'get media of a court' })
  @ApiBearerAuth()
  @Get('get_court_media/:id')
  get_court_media(@Param('id') id: string) {
    return this.court_service.getCourtMedia(id);
  }

  // @ApiOperation({
  //   summary: 'update media of a court , takes media.id as input',
  // })
  // @ApiBearerAuth()
  // @Roles('admin')
  // @UseGuards(AuthGuard('jwt'), RolesGuard)
  // @Post('update_court_media/:id')
  // update_court_media(
  //   @Param('id') id: string,
  //   @Body() dto: UpdateCourtMediaDto,
  // ) {
  //   return this.court_service.updateCourtMedia(id, dto);
  // }
}
