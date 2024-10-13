import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SignUpDto } from './dto/signup.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'Register as a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully.' })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data or duplicate username/email.',
  })
  @ApiResponse({ status: 500, description: 'Unexpected server error.' })
  @Post('/signup')
  signUp(@Body() signUpDto: SignUpDto): Promise<{ message: string }> {
    return this.authService.signUp(signUpDto);
  }

  @ApiOperation({ summary: 'Login once user has an account' })
  @ApiResponse({
    status: 200,
    description: 'User logged in successfully.',
    type: LoginResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials.' })
  @ApiResponse({ status: 500, description: 'Unexpected server error.' })
  @Post('/login')
  login(
    @Body() loginDto: LoginDto,
  ): Promise<{ token: string; message: string }> {
    return this.authService.login(loginDto);
  }
}
