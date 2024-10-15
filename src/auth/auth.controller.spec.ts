import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { BadRequestException } from '@nestjs/common';

describe('AuthController', () => {
    let authController: AuthController;
    let authService: AuthService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                {
                    provide: AuthService,
                    useValue: {
                        signUp: jest.fn(),
                        login: jest.fn(),
                    },
                },
            ],
        }).compile();

        authController = module.get<AuthController>(AuthController);
        authService = module.get<AuthService>(AuthService);
    });

    describe('signUp', () => {
        it('should successfully register a new user', async () => {
            const signUpDto: SignUpDto = {
                email: 'test@example.com',
                username: 'testuser',
                password: 'password123',
                roles: undefined,
            };

            const mockSignUpResponse = { message: 'User registered successfully' };

            authService.signUp = jest.fn().mockResolvedValue(mockSignUpResponse);

            const result = await authController.signUp(signUpDto);
            expect(result).toEqual(mockSignUpResponse);
        });

        it('should successfully register a new user without roles', async () => {
            const signUpDto: SignUpDto = {
                email: 'test@example.com',
                username: 'testuser',
                password: 'password123',
                roles: undefined,
            };

            const mockSignUpResponse = { message: 'User registered successfully' };

            authService.signUp = jest.fn().mockResolvedValue(mockSignUpResponse);

            const result = await authController.signUp(signUpDto);
            expect(result).toEqual(mockSignUpResponse);
        });

        it('should throw BadRequestException if invalid data is provided', async () => {
            const signUpDto: SignUpDto = {
                email: 'invalidEmail',
                username: 'user',
                password: 'pass',
                roles: undefined,
            };

            authService.signUp = jest.fn().mockRejectedValue(new BadRequestException('Invalid signup data'));

            await expect(authController.signUp(signUpDto)).rejects.toThrow(BadRequestException);
        });
    });

    describe('login', () => {
        it('should successfully log in a user', async () => {
            const loginDto: LoginDto = {
                usernameOrEmail: 'test@example.com',
                password: 'password123',
            };

            const mockLoginResponse = { token: 'mockToken123', message: 'Login successful' };

            authService.login = jest.fn().mockResolvedValue(mockLoginResponse);

            const result = await authController.login(loginDto);
            expect(result).toEqual(mockLoginResponse);
        });

        it('should throw BadRequestException if login data is invalid', async () => {
            const loginDto: LoginDto = {
                usernameOrEmail: 'test@example.com',
                password: 'short',
            };

            authService.login = jest.fn().mockRejectedValue(new BadRequestException('Invalid login credentials'));

            await expect(authController.login(loginDto)).rejects.toThrow(BadRequestException);
        });
    });
});