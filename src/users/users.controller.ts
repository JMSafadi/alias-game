import { Body, Controller, Post } from "@nestjs/common";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/CreateUser.dto";

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}
  
  @Post()
  createUsers(@Body() createUserDto: CreateUserDto) {
    console.log(createUserDto)
    return this.usersService.createUser(createUserDto)
  }
}
