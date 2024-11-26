
//auth/dto/court_spec.dto.ts
import { ApiProperty } from "@nestjs/swagger";
import {IsNotEmpty, IsString } from "class-validator";

export class CourtSpecDto {
    
    @ApiProperty({
        description: 'The name of the court specification (e.g., court type)',
        example: 'court_type',
      })
    @IsString()
    @IsNotEmpty()
    name: string;


    @ApiProperty({
        description: 'The value of the specification (e.g., grass, clay)',
        example: 'clay',
      })
    @IsNotEmpty()
    @IsString()
    value: string;
}


