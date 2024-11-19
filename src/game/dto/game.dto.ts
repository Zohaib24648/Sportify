import { IsNotEmpty, IsString } from "class-validator";

export class GameDto {
    
    @IsNotEmpty()
    @IsString()
    name: string;
}