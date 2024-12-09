import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsUUID } from "class-validator";

export class ReviewIdDto {
    @ApiProperty({ description: 'UUID of the review',example:"65c21056-2f81-4aa9-a10c-a7c349c750c9" })
    @IsNotEmpty()
    @IsUUID()
    review_id: string;
}