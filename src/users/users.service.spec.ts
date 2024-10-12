import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '../schemas/User.schema';
import { NotFoundException, ConflictException } from '@nestjs/common';
import mongoose from 'mongoose';

describe('UsersService', () => {
    let usersService: UsersService;
    let userModel: any;

    const mockUser = {
        _id: new mongoose.Types.ObjectId().toHexString(),
        email: 'test@example.com',
        username: 'testuser',
        password: 'hashedPassword',
    };

    const mockUserWithSave = Object.create(mockUser);
    mockUserWithSave.save = jest.fn().mockResolvedValue(mockUserWithSave);

    const mockFind = {
        select: jest.fn().mockReturnThis(),
        exec: jest.fn(),
    };

    const mockFindById = {
        select: jest.fn().mockReturnThis(),
        exec: jest.fn(),
    };

    const mockUserModel = {
        find: jest.fn().mockReturnValue(mockFind),
        findById: jest.fn().mockReturnValue(mockFindById),
        findOne: jest.fn(),
        findByIdAndDelete: jest.fn(),
        save: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                { provide: getModelToken(User.name), useValue: mockUserModel },
            ],
        }).compile();

        usersService = module.get<UsersService>(UsersService);
        userModel = module.get(getModelToken(User.name));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getAllUsers', () => {
        it('should return a list of users', async () => {
            mockFind.exec.mockResolvedValue([mockUser]);
            const result = await usersService.getAllUsers();
            expect(result).toEqual([mockUser]);
            expect(userModel.find).toHaveBeenCalled();
        });

        it('should throw NotFoundException if no users are found', async () => {
            mockFind.exec.mockResolvedValue([]);
            await expect(usersService.getAllUsers()).rejects.toThrow(NotFoundException);
            expect(userModel.find).toHaveBeenCalled();
        });
    });

    describe('getUserById', () => {
        it('should return a user by ID', async () => {
            userModel.findById.mockReturnValue(mockFindById);
            mockFindById.exec.mockResolvedValue(mockUser);

            const result = await usersService.getUserById(mockUser._id);
            expect(result).toEqual(mockUser);
            expect(userModel.findById).toHaveBeenCalledWith(mockUser._id);
        });

        it('should throw NotFoundException if user is not found', async () => {
            userModel.findById.mockReturnValue(mockFindById);
            mockFindById.exec.mockResolvedValue(null);

            await expect(usersService.getUserById(mockUser._id)).rejects.toThrow(NotFoundException);
            expect(userModel.findById).toHaveBeenCalledWith(mockUser._id);
        });
    });

    describe('updateUser', () => {
        it('should update a user successfully', async () => {
            userModel.findById.mockResolvedValue(mockUserWithSave);
            const updateData = { email: 'updated@example.com', username: 'updateduser' };

            const result = await usersService.updateUser(mockUserWithSave._id, updateData);
            expect(result.message).toBe(`User's information updated successfully.`);
        });

        it('should throw ConflictException if email is already taken', async () => {
            userModel.findById.mockResolvedValue(mockUserWithSave);
            userModel.findOne.mockResolvedValue({ _id: 'anotherUserId' });

            const updateData = { email: 'updated@example.com' };
            await expect(usersService.updateUser(mockUserWithSave._id, updateData)).rejects.toThrow(ConflictException);
        });
    });

    describe('deleteUserById', () => {
        it('should delete a user successfully', async () => {
            userModel.findByIdAndDelete.mockResolvedValue(mockUser);
            const result = await usersService.deleteUserById(mockUser._id);
            expect(result.message).toBe(`User with ID ${mockUser._id} deleted successfully.`);
        });

        it('should throw NotFoundException if user is not found', async () => {
            userModel.findByIdAndDelete.mockResolvedValue(null);
            await expect(usersService.deleteUserById(mockUser._id)).rejects.toThrow(NotFoundException);
        });
    });
});