import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getModelToken } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { User } from '../schemas/User.schema';
import { SignUpDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { Role } from '../modules/common/roles/role.enum';

jest.mock('bcryptjs', () => ({
    hash: jest.fn().mockResolvedValue('hashedPassword'),
    compare: jest.fn().mockResolvedValue(true),
}));

describe('AuthService', () => {
    let authService: AuthService;
    let userModel: any;
    let jwtService: JwtService;

    const mockUser = {
        _id: 'someUserId',
        email: 'test@example.com',
        username: 'testuser',
        password: 'hashedPassword',
    };

    const mockUserModel = {
        findOne: jest.fn(),
        create: jest.fn(),
    };

    const mockJwtService = {
        sign: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                { provide: getModelToken(User.name), useValue: mockUserModel },
                { provide: JwtService, useValue: mockJwtService },
            ],
        }).compile();

        authService = module.get<AuthService>(AuthService);
        userModel = module.get(getModelToken(User.name));
        jwtService = module.get<JwtService>(JwtService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('signUp', () => {
        it('should successfully create a new user', async () => {
            const signUpDto: SignUpDto = {
                email: 'newuser@example.com',
                username: 'newuser',
                password: 'password123',
            };

            jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword');
            userModel.create.mockResolvedValue(mockUser);

            const result = await authService.signUp(signUpDto);
            expect(result.message).toBe(
                `Your registration has been successful. Now you can log in using your username: 'newuser' or email: 'newuser@example.com'.`,
            );
        });

        it('should throw BadRequestException if username is taken', async () => {
            const signUpDto: SignUpDto = {
                email: 'newuser@example.com',
                username: 'newuser',
                password: 'password123',
            };

            userModel.create.mockRejectedValue({
                code: 11000,
                keyPattern: { username: 1 },
            });

            await expect(authService.signUp(signUpDto)).rejects.toThrow(
                new BadRequestException(`The username 'newuser' is already taken. Please choose another one.`),
            );
        });

        it('should throw BadRequestException if email is already in use', async () => {
            const signUpDto: SignUpDto = {
                email: 'newuser@example.com',
                username: 'newuser',
                password: 'password123',
            };

            userModel.create.mockRejectedValue({
                code: 11000,
                keyPattern: { email: 1 },
            });

            await expect(authService.signUp(signUpDto)).rejects.toThrow(
                new BadRequestException(`The email 'newuser@example.com' is already in use. Please use another one.`),
            );
        });
    });

    describe('login', () => {
        it('should return a token and welcome message when credentials are correct', async () => {
            const loginDto: LoginDto = {
                usernameOrEmail: 'testuser',
                password: 'password123',
            };

            userModel.findOne.mockResolvedValue(mockUser);
            jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
            mockJwtService.sign.mockReturnValue('validJwtToken');

            const result = await authService.login(loginDto);
            expect(result).toEqual({
                token: 'validJwtToken',
                message: 'Welcome back, testuser!',
            });
        });

        it('should throw UnauthorizedException if credentials are invalid', async () => {
            const loginDto: LoginDto = {
                usernameOrEmail: 'wronguser',
                password: 'password123',
            };

            userModel.findOne.mockResolvedValue(null);

            await expect(authService.login(loginDto)).rejects.toThrow(
                new UnauthorizedException('Invalid credentials. Please verify the inputted information.'),
            );
        });

        it('should throw UnauthorizedException if password does not match', async () => {
            const loginDto: LoginDto = {
                usernameOrEmail: 'testuser',
                password: 'wrongpassword',
            };

            userModel.findOne.mockResolvedValue(mockUser);
            jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

            await expect(authService.login(loginDto)).rejects.toThrow(
                new UnauthorizedException('Invalid credentials. Please verify the inputted information.'),
            );
        });
    });
});