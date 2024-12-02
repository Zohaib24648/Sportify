import { ApiProperty } from '@nestjs/swagger';
import { MEDIA_TYPE } from '@prisma/client';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class UpdateCourtMediaDto {
  //court_id: string, media_link: string , media_type: MEDIA_TYPE

  @ApiProperty({
    description: 'The link to the media',
    example: 'http://example.com/media.jpg',
  })
  @IsNotEmpty()
  media_link: string;

  @ApiProperty({
    description: 'The type of media',
    example: 'image',
  })
  @IsEnum(MEDIA_TYPE, { message: 'Invalid media type' })
  media_type: MEDIA_TYPE;
}
