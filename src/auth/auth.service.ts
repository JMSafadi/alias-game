import {
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../schemas/User.schema';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { SignUpDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private jwtService: JwtService;
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
  ) {
    // Inicjalizacja JwtService z odpowiednią konfiguracją
    this.jwtService = new JwtService({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '24h' },
    });
  }

  async signUp(signUpDto: SignUpDto): Promise<{ message: string }> {
    const { email, username, password } = signUpDto;
    try {
      //Hash password.
      const hashedPassword = await bcrypt.hash(password, 10);

      await this.userModel.create({
        email,
        username,
        password: hashedPassword,
      });

      return {
        message: `Your registration has been successful. Now you can log in using your username: '${username}' or email: '${email}'.`,
      };
    } catch (error) {
      if (error.code === 11000) {
        //Check if the error is a duplicate key error (E11000).
        if (error.keyPattern?.username) {
          //Determine which field caused the error.
          throw new BadRequestException(
            `The username '${username}' is already taken. Please choose another one.`,
          );
        } else if (error.keyPattern?.email) {
          throw new BadRequestException(
            `The email '${email}' is already in use. Please use another one.`,
          );
        }
      }
      //Throw any other errors not related to duplicates.
      throw new InternalServerErrorException(
        'An unexpected error occurred during registration.',
      );
    }
  }
  async login(loginDto: LoginDto): Promise<{ token: string; message: string }> {
    const { usernameOrEmail, password } = loginDto;

    //Check if is a username or email.
    const isEmail = usernameOrEmail.includes('@'); //Basic email verification.

    //Find user by either email or username.
    const user = await this.userModel.findOne(
      isEmail ? { email: usernameOrEmail } : { username: usernameOrEmail },
    );

    //Check if the user exists and if the password matches.
    const isPasswordMatched = user
      ? await bcrypt.compare(password, user.password)
      : false;

    if (!user || !isPasswordMatched) {
      throw new UnauthorizedException(
        'Invalid credentials. Please verify the inputted information.',
      );
    }

    //Generate JWT token.
    const token = this.jwtService.sign({ id: user._id });
    return {
      token,
      message: `Welcome back, ${user.username}!`,
    };
  }
}
