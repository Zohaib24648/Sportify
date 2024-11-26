//auth/dto/auth.dto.ts
import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";
export class AuthDto {

//swagger documentation

    @ApiProperty({ description: 'The user\'s email address' })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ description: 'The user\'s password' })
    @IsNotEmpty()
    @IsString()
    password: string;
}
