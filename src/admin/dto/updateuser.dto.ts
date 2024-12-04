import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsPhoneNumber,
  IsOptional,
  IsEmail,
} from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({ description: "The user's full name", example: 'John Doe' })
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  name: string;

  @ApiProperty({
    description: "The user's phone number",
    example: '+923331234567',
  })
  @IsNotEmpty()
  @IsOptional()
  @IsPhoneNumber('PK', {
    message: 'Phone number must be in the format +923331234567',
  })
  user_phone: string;

  @IsOptional()
  @ApiProperty({
    description: "The user's phone number",
    example: '+923331234567',
  })
  @IsOptional()
  @IsPhoneNumber('PK', {
    message: 'Phone number must be in the format +923331234567',
  })
  secondary_user_phone: string;

  @IsOptional()
  @ApiProperty({
    description: "The user's email address",
    example: 'user@gmail.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsOptional()
  @ApiProperty({ description: "The user's password", example: 'password' })
  @IsNotEmpty()
  @IsString()
  password_hash: string;
}
