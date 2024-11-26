import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";


export class AddGameCourtDto {
    
    
    @ApiProperty({ description: 'The game type ID to be linked to the court', example: '1234' })
    @IsString()
    @IsNotEmpty()
    game_type_id: string;
    
    @ApiProperty({ description: 'The court ID where the game will be played', example: '5678' })
    @IsNotEmpty()
    @IsString()
    court_id: string;
    
}