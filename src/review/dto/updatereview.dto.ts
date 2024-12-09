import { IsNotEmpty } from "class-validator";
import { ReviewDto } from "./review.dto";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateReviewDto extends ReviewDto {
    @ApiProperty({ description: 'ID of the review to update' })
    @IsNotEmpty()
    id: string;
}