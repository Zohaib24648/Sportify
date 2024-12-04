// src/game/dto/addgamecourt.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class AddGameCourtDto {
  @ApiProperty({
    description: 'The court ID where the games will be played',
    example: '5678',
  })
  @IsString()
  court_id: string;

  @ApiProperty({
    description: 'Array of game type IDs to be linked to the court',
    example: ['1234', '5678'],
  })
  @IsArray()
  game_type_ids: string[];
}