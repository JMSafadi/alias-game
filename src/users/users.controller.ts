import {
  Body,
  Controller,
  Get,
  HttpException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/CreateUser.dto';
import mongoose from 'mongoose';
import { JwtAuthGuard } from 'src/auth/local-auth.guard';
import { RolesGuard } from 'src/modules/common/guards/roles.guard';
import { Role } from 'src/modules/common/roles/role.enum';
import { Roles } from 'src/modules/common/roles/roles.decorator';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) { }

  // Create a new user
  @Post()
  createUsers(@Body() createUserDto: CreateUserDto) {
    console.log(createUserDto);
    return this.usersService.createUser(createUserDto);
  }
  // Get all users
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Get()
  getUsers() {
    return this.usersService.getUsers();
  }
  // Get one user by ID
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Get(':id')
  async getUserById(@Param('id') id: string) {
    const isValid = mongoose.Types.ObjectId.isValid(id);
    if (!isValid) throw new HttpException('User not found.', 404);
    const foundUser = await this.usersService.getUserById(id);
    if (!foundUser) throw new HttpException('User not found.', 404);
    return foundUser;
  }
}
