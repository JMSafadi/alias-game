import { Controller, Get, Delete, Param, Put, Body } from '@nestjs/common';
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

  //Route to update a specific user's information.
  @Put(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() updateData: { email?: string, username?: string, password?: string }
  ) {
    return this.usersService.updateUser(id, updateData);
  }

  //Route to delete a user by ID.
  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    return this.usersService.deleteUserById(id);
  }
}