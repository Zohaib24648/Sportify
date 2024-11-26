import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class GameDto {
    
    @ApiProperty({ description: 'The name of the game', example: 'Tennis' })
    @IsNotEmpty()
    @IsString()
    name: string;
}