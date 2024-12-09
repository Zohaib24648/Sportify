import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, Min, Max, IsNumber } from "class-validator"

export class ReviewDto {
    @ApiProperty({ description: 'Rating from 0 to 5' })
    @Min(0)
    @Max(5)
    @IsNumber()
    rating: number;

    @ApiProperty({ description: 'Review text content' })
    @IsNotEmpty()
    review_text: string;
}