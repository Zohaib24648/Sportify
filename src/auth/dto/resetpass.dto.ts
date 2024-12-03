import { ApiProperty } from "@nestjs/swagger";
import { IsEmail } from "class-validator";

export class ResetPassDto {

@ApiProperty()
token: string;

@ApiProperty()
@IsEmail()
new_password: string;

}