import { IsNotEmpty, IsString } from "class-validator";


export class AddGameCourtDto {
    
    @IsString()
    @IsNotEmpty()
    game_type_id: string;
    
    @IsNotEmpty()
    @IsString()
    court_id: string;
    
}