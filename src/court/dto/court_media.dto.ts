import { ApiProperty } from '@nestjs/swagger';
import { MEDIA_TYPE } from '@prisma/client';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class CourtMediaDto {

  @ApiProperty({
    description: 'The link to the media',
    example: 'http://example.com/media.jpg',
  })
  @IsNotEmpty()
  media_link: string;


  @ApiProperty({
    description: 'The type of media',
    example: 'image',
    enum: MEDIA_TYPE,
  })
  @IsEnum(MEDIA_TYPE, { message: 'Invalid media type' })
  media_type: MEDIA_TYPE;
}
