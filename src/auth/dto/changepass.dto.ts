import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  
  
  @ApiProperty({ description: 'The old password of the user', type: String, example: 'oldpassword' })
  @IsString()
  @IsNotEmpty()
  oldPassword: string;

  @ApiProperty({ description: 'The new password of the user', type: String, example: 'newpassword' })
  @IsString()
  @IsNotEmpty()
  newPassword: string;
}
