import { ApiProperty } from "@nestjs/swagger";
import { REVIEW_STATUS } from "@prisma/client";
import { IsEnum, IsNotEmpty, IsUUID } from "class-validator";

export class ChangeReviewStatusDto {
    @ApiProperty({ description: 'ID of the review to change status' })
    @IsNotEmpty()
    @IsUUID()
    id: string;

    @ApiProperty({ 
        description: 'New status for the review',
        enum: REVIEW_STATUS
    })
    @IsEnum(REVIEW_STATUS)
    status: REVIEW_STATUS;
}