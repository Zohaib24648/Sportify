// src/auth/auth.controller.ts
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto, SigninDto } from './dto';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { ResetPassDto } from './dto/resetpass.dto';
import { ChangePasswordDto } from './dto/changepass.dto';
import { Roles } from './guard/roles.decorator';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from './guard/roles.guard';
import { EmailDto } from 'src/dtos-common/email.dto';


@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: SignupDto })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully.',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 409, description: 'Email or phone number already exists.' })
  @Post('signup')
  async signup(@Body() dto: SignupDto){
    return await this.authService.signup(dto);
  }

  @ApiOperation({ summary: 'User login' })
  @ApiBody({ type: SigninDto })
  @ApiResponse({
    status: 200,
    description: 'User logged in successfully.',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 401, description: 'Invalid email or password.' })
  @ApiResponse({ status: 403, description: 'Email not verified.' })
  @Post('signin')
  async signin(@Body() dto: SigninDto){
    return await this.authService.signin(dto);
  }

  @ApiOperation({ summary: 'Verify user email' })
  @ApiParam({ name: 'token', description: 'Verification token' })
  @ApiResponse({
    status: 200,
    description: 'User verified successfully.',
  })
  @ApiResponse({ status: 400, description: 'Invalid or expired token.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @Get('verify-user/:token')
  async verifyUser(@Param('token') token: string){
    return await this.authService.verifyUser(token);
  }

  @ApiOperation({ summary: 'Resend verification email' })
  @ApiParam({ name: 'email', description: 'User email address' })
  @ApiResponse({
    status: 200,
    description: 'Verification email sent successfully.',
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @Get('resend-verification-email/:email')
  async resendVerificationEmail(
    @Param('email') email: string,
  ){
    return await this.authService.resendVerificationEmail(email);
  }

  @ApiOperation({ summary: 'Request password reset' })
  @ApiBody({ schema: { example: { email: 'user@example.com' } } })
  @ApiResponse({
    status: 200,
    description: 'Password reset link sent.',
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @Post('forgot-password')
  async forgotPassword(@Body('email') email: EmailDto){
    return await this.authService.forgotPassword(email);
  }

  @ApiOperation({ summary: 'Reset password' })
  @ApiBody({ type: ResetPassDto })
  @ApiResponse({
    status: 200,
    description: 'Password reset successfully.',
  })
  @ApiResponse({ status: 400, description: 'Invalid or expired token.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPassDto){
    return await this.authService.resetPassword(dto);
  }


  @ApiOperation({ summary: 'Change password' })
  @ApiBody({ type: ResetPassDto })
  @ApiResponse({
    status: 200,
    description: 'Password reset successfully.',
  })
  @ApiResponse({ status: 400, description: 'Invalid or expired token.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @Post('change-password')
  @Roles('user','admin')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  async changePassword(@Req() req ,@Body() dto: ChangePasswordDto){
    const userId = req.user.userId;
  return await this.authService.changePassword(userId, dto);
  }
}