//auth/auth.controller.ts
import { Body, Controller, Get, Param, Post, Query, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto, SigninDto } from './dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ResetPassDto } from './dto/resetpass.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'Sign up a new user' })
  @ApiResponse({
    status: 201,
    description: 'User successfully created and signed in.',
  })
  @ApiResponse({ status: 500, description: 'Undefined Error' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  @Post('signup')
  signup(@Body() req: SignupDto) {
    return this.authService.signup(req);
  }

  @ApiOperation({ summary: 'Sign in an existing user' })
  @ApiResponse({
    status: 201,
    description: 'User successfully signed in. and a Token is returned',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized \ Credentials are Incorrect',
  })
  @ApiResponse({ status: 500, description: 'Undefined Error' })
  @Post('signin')
  signin(@Body() req: SigninDto) {
    return this.authService.signin(req);
  }

  
  
  
  
  
  @ApiOperation({ summary: 'Verifies the user' })
  @ApiResponse({ status: 500, description: 'Undefined Error' })
  @Get('verify_user/:token')
  verifyUser(@Param('token') token: string) {
    return this.authService.verifyUser(token);
  }

  @ApiOperation({ summary: 'Resends Verification Email' })
  @ApiResponse({ status: 500, description: 'Undefined Error' })
  @Get('resend_verification_email/:email')
  resendVerificationEmail(@Param('email') email: string) {
    return this.authService.resendVerificationEmail(email);
  }

  @ApiOperation({ summary: 'Forgot Password' })
  @ApiResponse({ status: 500, description: 'Undefined Error' })
  @Get('forgot_password/:email')
  forgotPassword(@Param('email') email: string) {
    return this.authService.forgotPassword(email);
  }

  @ApiOperation({ summary: 'Forgot Password_ Next Step' })
  @ApiResponse({ status: 500, description: 'Undefined Error' })
  @Get('forgot_password2')
  forgotPassword2(@Query() dto : ResetPassDto  ) {
    return this.authService.resetPassword(dto);
  }
}
