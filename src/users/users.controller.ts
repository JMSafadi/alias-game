import { Controller, Get, Delete, Param,   UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/local-auth.guard';
import { RolesGuard } from 'src/modules/common/guards/roles.guard';
import { Role } from 'src/modules/common/roles/role.enum';
import { Roles } from 'src/modules/common/roles/roles.decorator';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) { }

  //Route to fetch all users.
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Get()
  async getAllUsers() {
    return this.usersService.getAllUsers();
  }
  //Route to fetch a specific user by ID.
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
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
