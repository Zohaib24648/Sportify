import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty } from "class-validator";

export class EmailDto {
    @ApiProperty({
        description: "Email address",
        example: "example@gmail.com",
    })
    @IsEmail()
    @IsNotEmpty()
    email: string;

}