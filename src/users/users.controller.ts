import { Controller, Get, Delete, Param, } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) { }

  //Route to fetch all users.
  @Get()
  async getAllUsers() {
    return this.usersService.getAllUsers();
  }
  //Route to fetch a specific user by ID.
  @Get(':id')
  async getUserById(@Param('id') id: string) {
    return this.usersService.getUserById(id);;
  }

  //Route to delete a user by ID
  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    return this.usersService.deleteUserById(id);
  }
}
