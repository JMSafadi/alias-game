import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../schemas/User.schema';
import mongoose from 'mongoose';
import { validate, ValidationError } from 'class-validator';
import { UpdateUserDto } from './dto/UpdateUser.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) { }

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

  async updateUser(id: string, updateData: { email?: string, username?: string, password?: string }) {
    //Check if the ID is valid.
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Invalid user ID: ${id}.`);
    }

    const user = await this.userModel.findById(id);

    //Check if the user still exists.
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found.`);
    }

    //Create an instance of UpdateUserDto to validate against.
    const updateUserDto = new UpdateUserDto();
    updateUserDto.email = updateData.email ?? user.email;
    updateUserDto.username = updateData.username ?? user.username;
    updateUserDto.password = updateData.password ?? user.password;

    //Perform validation on the UpdateUserDto object to enforce class-validator rules
    const validationError = await validate(updateUserDto);

    //Check if the are any validation errors.
    if (validationError.length > 0) {
      const errorMessage = Object.values(validationError[0].constraints)[0];
      throw new BadRequestException(errorMessage);
    }

    //Check if the new email is already taken.
    if (updateData.email) {
      const existingUserWithEmail = await this.userModel.findOne({ email: updateData.email });
      if (existingUserWithEmail && existingUserWithEmail._id.toString() !== id) {
        throw new ConflictException(`Email ${updateData.email} is already taken.`);
      }
    }

    //Check if the new username is already taken.
    if (updateData.username) {
      const existingUserWithUsername = await this.userModel.findOne({ username: updateData.username });
      if (existingUserWithUsername && existingUserWithUsername._id.toString() !== id) {
        throw new ConflictException(`Username ${updateData.username} is already taken.`);
      }
    }

    //Update the provided fields.
    if (updateData.email) user.email = updateData.email;
    if (updateData.username) user.username = updateData.username;
    if (updateData.password) user.password = updateData.password;

    await user.save();
    return { message: `User's information updated successfully.` };
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
  }
}