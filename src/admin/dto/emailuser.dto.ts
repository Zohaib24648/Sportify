import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class EmailUserDto {

    

    @ApiProperty({ description: 'UserId of User' })
    @IsNotEmpty()
    id : string;
    
    
    @ApiProperty({ description: 'Email subject' })
    @IsNotEmpty()
    @IsString()
    subject: string;

    @ApiProperty({ description: 'Email content' })
    @IsNotEmpty()
    @IsString()
    content: string;
}

