import { Body, Controller, Delete, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/createreview.dto';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/auth/guard/roles.decorator';
import { UpdateReviewDto } from './dto/updatereview.dto';
import { ChangeReviewStatusDto } from './dto/changereviewstatus.dto';
import { CourtIdDto } from '../dtos-common/courtid.dto';
import { ReviewIdDto } from './dto/reviewid.dto';

@ApiTags('Reviews')
@Controller('review')
export class ReviewController {
    constructor(private readonly reviewService: ReviewService) {}

    @ApiOperation({ summary: 'Create a new review' })
    @ApiResponse({ status: 201, description: 'Review created successfully' })
    @ApiResponse({ status: 403, description: 'User has already reviewed this court' })
    @ApiResponse({ status: 404, description: 'User not found' })
    @ApiBearerAuth()
    @Roles('user', 'admin')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Post('create')
    create(@Req() req: any, @Body() dto: CreateReviewDto) {
        const dto1 = req.user;
        return this.reviewService.createReview(dto1, dto);
    }

    @ApiOperation({ summary: 'Update an existing review' })
    @ApiResponse({ status: 200, description: 'Review updated successfully' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @ApiResponse({ status: 404, description: 'Review not found' })
    @ApiBearerAuth()
    @Roles('user', 'admin')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Post('update')
    update(@Req() req: any, @Body() dto: UpdateReviewDto) {
        return this.reviewService.update(req, dto);
    }

    @ApiOperation({ summary: 'Delete a review' })
    @ApiResponse({ status: 200, description: 'Review deleted successfully' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @ApiResponse({ status: 404, description: 'Review not found' })
    @ApiBearerAuth()
    @Roles('admin', 'user')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Delete('delete')
    delete(@Req() req: any, @Body() dto: ReviewIdDto) {
        return this.reviewService.delete(req, dto);
    }

    @ApiOperation({ summary: 'Get all reviews (Admin only)' })
    @ApiResponse({ status: 200, description: 'Returns all reviews' })
    @ApiBearerAuth()
    @Roles('admin')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Get('getall')
    getallreviews() {
        return this.reviewService.getallreviews();
    }

    @ApiOperation({ summary: 'Get all published reviews' })
    @ApiResponse({ status: 200, description: 'Returns all published reviews' })
    @ApiBearerAuth()
    @Roles('admin', 'user')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Get('getpublished')
    getpublishedreviews() {
        return this.reviewService.getpublishedreviews();
    }

    @ApiOperation({ summary: 'Get reviews by logged in user' })
    @ApiResponse({ status: 200, description: 'Returns user\'s reviews' })
    @ApiBearerAuth()
    @Roles('admin', 'user')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Get('getmyreviews')
    getmyreviews(@Req() req: any) {
        return this.reviewService.getmyreviews(req);
    }

    @ApiOperation({ summary: 'Get reviews by court ID' })
    @ApiResponse({ status: 200, description: 'Returns court reviews' })
    @ApiBearerAuth()
    @Roles('admin', 'user')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Post('getreviewbycourt')
    getReviewByCourtId(@Body() court_id: CourtIdDto) {
        return this.reviewService.getReviewByCourtId(court_id);
    }

    @ApiOperation({ summary: 'Change review status (Admin only)' })
    @ApiResponse({ status: 200, description: 'Review status updated successfully' })
    @ApiResponse({ status: 404, description: 'Review not found' })
    @ApiBearerAuth()
    @Roles('admin')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Post('changeStatus')
    changeStatus(@Body() dto: ChangeReviewStatusDto) {
        return this.reviewService.changereviewstatus(dto);
    }
}