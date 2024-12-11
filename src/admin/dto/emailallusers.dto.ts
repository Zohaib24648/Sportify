// First create EmailAllUsersDto
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString, IsEnum } from 'class-validator';
import { ROLE } from '@prisma/client';

export class EmailAllUsersDto {
    @ApiProperty({ description: 'Email subject' })
    @IsNotEmpty()
    @IsString()
    subject: string;

    @ApiProperty({ description: 'Email content' })
    @IsNotEmpty()
    @IsString()
    content: string;

    @ApiProperty({ description: 'User roles to filter', isArray: true, enum: ROLE })
    @IsArray()
    @IsEnum(ROLE, { each: true })
    roles: ROLE[];
}

