import { IsNotEmpty, IsNumber, Max, Min } from "class-validator"
import { ReviewDto } from "./review.dto"
import { ApiProperty } from "@nestjs/swagger";

export class CreateReviewDto extends ReviewDto {
    @ApiProperty({ description: 'ID of the court to review' })
    @IsNotEmpty()
    court_id: string;
}