import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsEnum } from 'class-validator';
import { GAME_TYPE } from '@prisma/client';

export class GameDto {
  @ApiProperty({ description: 'The name of the game', example: 'Tennis' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'The description of the game', example: 'A sport played with a racket and ball' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'The category of the game', example: 'indoor', enum: GAME_TYPE })
  @IsNotEmpty()
  @IsEnum(GAME_TYPE)
  category: GAME_TYPE;

  @ApiProperty({ description: 'The person associated with the game', example: 'John Doe' })
  @IsNotEmpty()
  @IsString()
  person: string;
}