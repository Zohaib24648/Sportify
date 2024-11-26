//auth/dto/signup.dto.ts
import { IsNotEmpty, IsPhoneNumber, IsString } from "class-validator";
import { AuthDto } from "./auth.dto";
import { ApiProperty } from "@nestjs/swagger";

export class SignupDto extends AuthDto {
    @ApiProperty({ description: 'The user\'s full name' })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({ description: 'The user\'s phone number' })
    @IsNotEmpty()
    @IsPhoneNumber()
    user_phone: string;
}
