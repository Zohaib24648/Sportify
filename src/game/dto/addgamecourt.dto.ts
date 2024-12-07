// src/game/dto/addgamecourt.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class AddGameCourtDto {
  @ApiProperty({
    description: 'The ID of the court',
    example: 'court-uuid',
  })
  @IsString()
  @IsNotEmpty()
  court_id: string;

  @ApiProperty({
    description: 'Array of game IDs to associate with the court',
    example: ['game-uuid-1', 'game-uuid-2'],
  })
  @IsArray()
  @IsNotEmpty()
  game_ids: string[];
}