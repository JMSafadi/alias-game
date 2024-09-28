import { Body, Controller, Get, HttpException, Param, Post } from "@nestjs/common";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/CreateUser.dto";
import mongoose from "mongoose";

@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService) { }

    // Create a new user
    @Post()
    createUsers(@Body() createUserDto: CreateUserDto) {
        console.log(createUserDto)
        return this.usersService.createUser(createUserDto)
    }
    // Get all users
    @Get()
    getUsers() {
        return this.usersService.getUsers()
    }
    // Get one user by ID
    @Get(':id')
    async getUserById(@Param('id') id: string) {
        const isValid = mongoose.Types.ObjectId.isValid(id)
        if (!isValid) throw new HttpException('User not found.', 404)
        const foundUser = await this.usersService.getUserById(id)
        if (!foundUser) throw new HttpException('User not found.', 404)
        return foundUser
    }
}