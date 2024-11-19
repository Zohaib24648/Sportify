//auth/auth.controller.ts
import { Body, Controller, Post, Req } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { SignupDto,SigninDto } from "./dto";

@Controller('auth')
export class AuthController{
constructor(private authService:AuthService) {}

@Post('signup')
signup(@Body () req :SignupDto){
return this.authService.signup(req)
}


@Post('signin')
signin(@Body() req:SigninDto){
    return this.authService.signin(req)
    
}

}