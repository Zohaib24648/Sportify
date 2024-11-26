//auth/auth.controller.ts
import { Body, Controller, Post, Req } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { SignupDto,SigninDto } from "./dto";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

@ApiTags('auth') // Grouping under 'auth'
@Controller('auth')
export class AuthController{
constructor(private authService:AuthService) {}

@ApiOperation({ summary: 'Sign up a new user' })
@ApiResponse({ status: 201, description: 'User successfully created and signed in.' })
@ApiResponse({ status: 400, description: 'Bad request' })
@Post('signup')
signup(@Body () req :SignupDto){
return this.authService.signup(req)
}


@ApiOperation({ summary: 'Sign in an existing user' })
  @ApiResponse({ status: 200, description: 'User successfully signed in.' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
@Post('signin')
signin(@Body() req:SigninDto){
    return this.authService.signin(req)
    
}

}