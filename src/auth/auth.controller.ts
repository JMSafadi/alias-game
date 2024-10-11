import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SignUpDto } from './dto/signup.dto';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    //Route to register as a new user.
    @Post('/signup')
    signUp(@Body() signUpDto: SignUpDto): Promise<{ message: string }> {
        return this.authService.signUp(signUpDto);
    }

    //Route to login once user has an account.
    @Post('/login')
    login(@Body() loginDto: LoginDto): Promise<{ token: string; message: string }> {
        return this.authService.login(loginDto);
    }
}