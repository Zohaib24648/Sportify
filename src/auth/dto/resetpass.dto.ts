// src/auth/dto/resetpass.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ResetPassDto {
  @ApiProperty({ description: 'Reset token received via email' })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({ description: 'The new password for the user' })
  @IsString()
  @IsNotEmpty()
  new_password: string;
}