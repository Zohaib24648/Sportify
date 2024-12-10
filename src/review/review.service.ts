import { ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateReviewDto } from './dto/createreview.dto';
import { UpdateReviewDto } from './dto/updatereview.dto';
import { ChangeReviewStatusDto } from './dto/changereviewstatus.dto';
import { REVIEW_STATUS } from '@prisma/client';

@Injectable()
export class ReviewService {

    constructor (private readonly prisma: PrismaService) {}
    
    
    async createReview(dto1: any, dto: CreateReviewDto) {

        const { userId } = dto1;


        // Check if the user exists
        const userExists = await this.prisma.user.findUnique({
            where: { id: userId },
        });
    
        if (!userExists) {
            throw new NotFoundException('User not found');
        }

        //check if the user has already a review fot this court
        const reviewExists = await this.prisma.review.findFirst({
            where: {
                user_id: userId,
                court_id: dto.court_id
            }
        });
    
        if (reviewExists) {
            throw new ForbiddenException('You have already reviewed this court');
        }
        try {
            return await this.prisma.review.create({
                data: {
                    user_id: userId,
                    court_id: dto.court_id,
                    rating: dto.rating,
                    review_text: dto.review_text,
                },
            });
        } catch (error) {
            throw new InternalServerErrorException('Error creating review', error.message);
        }
    }
    async getallreviews(){
        try {
            
        return await this.prisma.review.findMany(
            {
                include:{
                    user: {
                        select:{
                            name: true,
                        }
                    },
                    court: {
                        select: {
                            name: true,
                        }
                    }
                }
            }
        );
        } catch (error) {
            throw new InternalServerErrorException('Error getting all reviews', error.message)
        }
    }


    async getpublishedreviews(){
        try {
            
        return await this.prisma.review.findMany({
            where: {
                published: REVIEW_STATUS.approved
            },
            include:{
                user: {
                    select:{
                        name: true,
                    }
                },
                court: {
                    select: {
                        name: true,
                    }
                }
            }
        }
        );
        } catch (error) {
            throw new InternalServerErrorException('Error getting all reviews', error.message)
        }
    }


    async changereviewstatus(dto: ChangeReviewStatusDto) {
        const {id, status} = dto;
        try {
            return await this.prisma.review.update({
                where: {id: id},
                data: {
                    published: status
                }
            })
        } catch (error) {
            throw new InternalServerErrorException('Error changing review status', error.message)
        }
    }



    findOne(id: number) {
        return `This action returns a #${id} review`;
    }

   
    async update(req: any, dto:UpdateReviewDto) {
        const { userId, role } = req.user;
        const {id, rating, review_text} = dto;
        
        const review = await this.prisma.review.findUnique({
            where: { id: id },
        });

        if (!review) {
            throw new NotFoundException('Review not found');
        }

        if (role !== 'admin' && review.user_id !== userId) {
            throw new ForbiddenException('You do not have permission to edit this review');
        }
try {
    return await this.prisma.review.update({
        where: {id: id},
        data: {
            rating: rating,
            review_text: review_text
        }
    })
} catch (error) {
    throw new InternalServerErrorException('Error updating review', error.message)
}

        
    }

    async delete(req: any, dto: any) {
        const { userId, role } = req.user;
        const {review_id} = dto;

        try {
            const review = await this.prisma.review.findUnique({
                where: { id: review_id },
            });

            if (!review) {
                throw new NotFoundException('Review not found');
            }

            if (role !== 'admin' && review.user_id !== userId) {
                throw new ForbiddenException('You do not have permission to delete this review');
            }

            return await this.prisma.review.delete({
                where: { id:review_id },
            });
        } catch (error) {
            throw new InternalServerErrorException('Error deleting review', error.message);
        }
    }


    async getReviewByCourtId(dto: any) {
        console.log(dto)
        const {court_id} = dto;
        console.log(court_id)
        try {
            return await this.prisma.review.findMany({
                where: {
                    court_id: court_id
                },
                include:{
                    user: {
                        select:{
                            name: true,
                        }
                    },
                    court: {
                        select: {
                            name: true,
                        }
                    }
                }
            })

        } catch (error) {
            throw new InternalServerErrorException('Error getting reviews', error.message)
        }

    }

    getReviewByUserId(userId: number) {
        return `This action returns a review by user id ${userId}`;
    }
    

    getmyreviews(req: any) {

        const { userId} = req.user;

        try {
            return this.prisma.review.findMany({
                where: {
                    user_id: userId
                },
                include:{
                    user: {
                        select:{
                            name: true,
                        }
                    },
                    court: {
                        select: {
                            name: true,
                        }
                    }
                }
            })
        } catch (error) {
            throw new InternalServerErrorException('Error getting reviews', error.message)
            
        }

    }



}
