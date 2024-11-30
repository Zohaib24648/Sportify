//auth/auth.controller.ts
import { Body, Controller, Post, Req } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { SignupDto,SigninDto } from "./dto";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

@ApiTags('Auth') 
@Controller('auth')
export class AuthController{
constructor(private authService:AuthService) {}

@ApiOperation({ summary: 'Sign up a new user' })
@ApiResponse({ status: 201, description: 'User successfully created and signed in.' })
@ApiResponse({ status: 500, description: 'Undefined Error' })
@ApiResponse({ status: 409, description: 'User already exists' })
@Post('signup')
signup(@Body () req :SignupDto){
return this.authService.signup(req)
}


  @ApiOperation({ summary: 'Sign in an existing user' })
  @ApiResponse({ status: 201, description: 'User successfully signed in. and a Token is returned' })
  @ApiResponse({ status: 401, description: 'Unauthorized \ Credentials are Incorrect' })
  @ApiResponse({ status: 500, description: 'Undefined Error' })
@Post('signin')
signin(@Body() req:SigninDto){
    return this.authService.signin(req)
    
}




}