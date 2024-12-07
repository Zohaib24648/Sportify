import { CreateCourtDto } from "src/court/dto/create-court.dto";
import { AddGameCourtDto } from "./addgamecourt.dto";
import { IsOptional, IsString } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';
export class UpdateGameCourtDto {

    @ApiProperty({
        description: 'The court ID where the games will be played',
        example: '2e608407-5578-4caf-a8f3-444afd2f976c',
      })
      @IsString()
      court_id: string;
   
    @ApiProperty({
        description: 'The ID of the Game ',
        example: '2e608407-5578-4caf-a8f3-444afd2f976c',
      })
      @IsString()
      game_type_id: string;



      

  
}