import { Decimal } from "@prisma/client/runtime/library";
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

//auth/dto/court.dto.ts
export class CourtDto {

    @IsString()
    @IsNotEmpty()
    name: string;
  
    @IsString()
    @IsOptional()
    description: string;
  
    @IsString()
    @IsNotEmpty()
    court_location: string;
  
    @IsNumber()
    @IsNotEmpty()
    hourly_rate:number;
  
    @IsNumber()
    @IsNotEmpty()
    min_down_payment: number;

}