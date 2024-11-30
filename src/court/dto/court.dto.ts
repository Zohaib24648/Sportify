import { ApiProperty } from "@nestjs/swagger";
import { Decimal } from "@prisma/client/runtime/library";
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

//auth/dto/court.dto.ts
export class CourtDto {

    @ApiProperty({
        description: 'The name of the court',
        example: 'Main Court',
    })
    @IsString()
    @IsNotEmpty()
    name: string;
 
    
    @ApiProperty({
        description: 'A description of the court',
        example: 'A large court for basketball and tennis',
        required: false,
    })
    @IsString()
    @IsOptional()
    description: string;
  
  
    
    @ApiProperty({
        description: 'The location of the court',
        example: 'Downtown',
    })
    @IsString()
    @IsNotEmpty()
    court_location: string;
  

    @ApiProperty({
        description: 'The hourly rate for using the court',
        example: 5000,
    })
    @IsNumber()
    @IsNotEmpty()
    hourly_rate:number;


    @ApiProperty({
        description: 'The minimum percentage down payment required to book the court',
        example: 30,
    })
    @IsNumber()
    @IsNotEmpty()
    min_down_payment: number;

}