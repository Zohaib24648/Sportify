import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsPositive, Min } from 'class-validator';

export class PaginationDto
{
  @ApiProperty( {
    description: 'The page number to retrieve',
    type: Number,
    example: 1,
  } )
  @IsOptional()
  @IsPositive()
  @Type( () => Number )
  page?: number;

  @ApiProperty( {
    description: 'The number of items per page',
    type: Number,
    example: 10,
  } )
  @IsOptional()
  @Min( 1 )
  @Type( () => Number )
  limit?: number;
}
