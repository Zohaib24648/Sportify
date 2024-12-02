//auth/dto/auth.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
export class AuthDto {
  //swagger documentation

  @ApiProperty({
    description: "The user's email address",
    example: 'user@gmail.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: "The user's password", example: 'password' })
  @IsNotEmpty()
  @IsString()
  password: string;
}
