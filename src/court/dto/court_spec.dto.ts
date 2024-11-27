
//auth/dto/court_spec.dto.ts
import { ApiProperty } from "@nestjs/swagger";
import {IsNotEmpty, IsString } from "class-validator";

export class CourtSpecDto {
    
    @ApiProperty({
        description: 'The name of the court specification',
        example: 'area',
      })
    @IsString()
    @IsNotEmpty()
    name: string;


    @ApiProperty({
        description: 'The value of the specification',
        example: '500sqm',
      })
    @IsNotEmpty()
    @IsString()
    value: string;
}


