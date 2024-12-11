import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsUUID } from "class-validator";

export class UserIdDto {
    @ApiProperty({ description: 'UUID of the User',example:"65c21056-2f81-4aa9-a10c-a7c349c750c9" })
    @IsNotEmpty()
    @IsUUID()
    user_id: string;
}