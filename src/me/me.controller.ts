import { Controller, Get, Delete, UseGuards, Put, Body } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser } from './decorators/current-user.decorator';

@ApiTags('me')
@UseGuards(JwtAuthGuard)
@Controller('me')
export class MeController {
  constructor(private usersService: UsersService) { }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my own data' })
  @ApiResponse({ status: 200, description: 'User details retrieved successfully.' })
  @Get()
  async getMyDetails(@CurrentUser() user: any) {
    const id = user.id
    return this.usersService.getUserById(id);
  }


  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update my own user' })
  @ApiResponse({ status: 200, description: 'User updated successfully.' })
  @Put()
  async updateUser(
    @CurrentUser() user: any,
    @Body() updateData: { email?: string, username?: string, password?: string }
  ) {
    const id = user.id
    return this.usersService.updateUser(id, updateData);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete my own user' })
  @ApiResponse({ status: 200, description: 'User deleted successfully.' })
  @Delete()
  async deleteUser(@CurrentUser() user: any,) {
    const id = user.id
    return this.usersService.deleteUserById(id);
  }
}