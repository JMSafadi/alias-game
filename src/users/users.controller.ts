import {
  Controller,
  Get,
  Delete,
  Param,
  UseGuards,
  Put,
  Body,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/modules/common/guards/roles.guard';
import { Role } from 'src/modules/common/roles/role.enum';
import { Roles } from 'src/modules/common/roles/roles.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('users')
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseGuards(RolesGuard)
  @Roles(Role.Admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({
    status: 200,
    description: 'List of all users retrieved successfully.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Only admins can access this route.',
  })
  @Get()
  async getAllUsers() {
    return this.usersService.getAllUsers();
  }

  @UseGuards(RolesGuard)
  @Roles(Role.Admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({
    status: 200,
    description: 'User details retrieved successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found with the provided ID.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Only admins can access this route.',
  })
  @ApiParam({ name: 'id', description: 'User ID' })
  @Get(':id')
  async getUserById(@Param('id') id: string) {
    return this.usersService.getUserById(id);
  }
  @UseGuards(RolesGuard)
  @Roles(Role.Admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a user by ID' })
  @ApiResponse({ status: 200, description: 'User updated successfully.' })
  @ApiResponse({
    status: 404,
    description: 'User not found with the provided ID.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Only admins can access this route.',
  })
  @ApiParam({ name: 'id', description: 'User ID' })
  @Put(':id')
  async updateUser(
    @Param('id') id: string,
    @Body()
    updateData: {
      email?: string;
      username?: string;
      password?: string;
      roles?: Role[];
    },
  ) {
    return this.usersService.updateUser(id, updateData);
  }
  @UseGuards(RolesGuard)
  @Roles(Role.Admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a user by ID' })
  @ApiResponse({ status: 200, description: 'User deleted successfully.' })
  @ApiResponse({
    status: 404,
    description: 'User not found with the provided ID.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Only admins can access this route.',
  })
  @ApiParam({ name: 'id', description: 'User ID' })
  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    return this.usersService.deleteUserById(id);
  }
}
