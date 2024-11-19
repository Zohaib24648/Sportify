
//auth/dto/court_spec.dto.ts
import {IsNotEmpty, IsString } from "class-validator";

export class CourtSpecDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    @IsString()
    value: string;
}


