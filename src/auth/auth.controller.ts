import { Body, Controller, Post, Req } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { authDto } from "./dto";

@Controller('auth')
export class AuthController{
constructor(private authSerive:AuthService) {}

@Post('signup')
signup(@Body () req :authDto){
return this.authSerive.signup(req)
}


@Post('signin')
signin(@Body() req:authDto){
    return this.authSerive.signin(req)
    
}

}