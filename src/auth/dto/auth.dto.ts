//auth/dto/auth.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, IsStrongPassword } from 'class-validator';
export class AuthDto {
  @ApiProperty({
    description: "The user's email address",
    example: 'admin@gmail.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: "The user's password", example: 'password' })
  @IsNotEmpty()
  @IsString()
  // @IsStrongPassword()
  password: string;
}
