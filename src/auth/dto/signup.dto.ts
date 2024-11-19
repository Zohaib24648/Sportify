//auth/dto/signup.dto.ts
import { IsNotEmpty, IsPhoneNumber, IsString } from "class-validator";
import { AuthDto } from "./auth.dto";

export class SignupDto extends AuthDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsPhoneNumber()
    user_phone: string;
}
