//auth/dto/signup.dto.ts
import { IsNotEmpty, IsOptional, IsPhoneNumber, IsString } from "class-validator";
import { AuthDto } from "./auth.dto";
import { ApiProperty } from "@nestjs/swagger";

export class SignupDto extends AuthDto {
    @ApiProperty({ description: 'The user\'s full name', example: "John Doe" })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({ description: 'The user\'s phone number' , example: "+923331234567"})
    @IsNotEmpty()
    @IsPhoneNumber('PK', { message: 'Phone number must be in the format +923331234567' })
    user_phone: string;

    @ApiProperty({ description: 'The user\'s phone number' , example: "+923331234567"})
    @IsOptional()
    @IsPhoneNumber('PK', { message: 'Phone number must be in the format +923331234567' })
    secondary_user_phone: string;

}
