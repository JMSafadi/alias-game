import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/schemas/User.schema';
import mongoose from 'mongoose';

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