import { Injectable, UnauthorizedException } from '@nestjs/common';
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
      signOptions: { expiresIn: '1h' },
    });
  }

  async signUp(signUpDto: SignUpDto): Promise<{ token: string }> {
    console.log('JwtService in AuthService:', this.jwtService);
    const { username, password } = signUpDto;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.userModel.create({
      username,
      password: hashedPassword,
    });

    const token = this.jwtService.sign({ id: user._id });

    return { token };
  }

  async login(loginDto: LoginDto): Promise<{ token: string }> {
    const { username, password } = loginDto;

    const user = await this.userModel.findOne({ username });

    if (!user) {
      throw new UnauthorizedException('Invalid username or password');
    }

    const isPasswordMatched = await bcrypt.compare(password, user.password);

    if (!isPasswordMatched) {
      throw new UnauthorizedException('Invalid username or password');
    }

    const token = this.jwtService.sign({ id: user._id });

    return { token };
  }
}
