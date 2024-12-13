import { ApiProperty } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';  
import { COURT_TYPE } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

//auth/dto/court.dto.ts
export class CourtDto {
  @ApiProperty({
    description: 'The name of the court',
    example: 'Main Court',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
  description: 'The Type of court',
  example: COURT_TYPE,
  required: true,
})
@IsEnum(COURT_TYPE, { message: 'Invalid court type' })
court_type: COURT_TYPE;


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
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  court_location: string;

  @ApiProperty({
    description: 'The hourly rate for using the court',
    example: 5000,
    required: true,
  })
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  hourly_rate: number;

  @ApiProperty({
    description: 'The minimum percentage down payment required to book the court',
    example: 30,
    required: true,
  })
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  min_down_payment: number;
}

export class UpdateCourtDto extends PartialType(CourtDto) {}
