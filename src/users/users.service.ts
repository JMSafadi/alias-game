import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../schemas/User.schema';
import mongoose from 'mongoose';
import { Role } from '../modules/common/roles/role.enum';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

<<<<<<< HEAD
  createUser(createUserDto: CreateUserDto) {
    const newUser = new this.userModel(createUserDto);
    return newUser.save();
  }

  getUsers() {
    return this.userModel.find();
  }

  getUserById(id: string) {
    return this.userModel.findById(id);
=======
  async getAllUsers() {
    const users = await this.userModel.find().select('-__v').exec();

    if (users.length === 0) {
      throw new NotFoundException('No active Users.');
    }

    return users;
  }

  async getUserById(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Invalid user ID: ${id}.`);
    }

    const user = await this.userModel.findById(id).select('-__v -_id').exec();

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found.`);
    }

    return user;
  }

  async deleteUserById(id: string): Promise<{ message: string }> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Invalid user ID: ${id}.`);
    }

    const user = await this.userModel.findByIdAndDelete(id);

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found.`);
    }

    return { message: `User with ID ${id} deleted successfully.` };
>>>>>>> 522574e5553d70f50a6b834eb9b21e4b3a9dfed2
  }
}
