import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('UsersController', () => {
    let usersController: UsersController;
    let usersService: UsersService;

    beforeEach(async () => {
        const mockUsers = [
            {
                email: 'johnDoe@examplemail.com',
                username: 'John Doe',
                password: 'hashedPassword',
            }
        ];

        const module: TestingModule = await Test.createTestingModule({
            controllers: [UsersController],
            providers: [
                {
                    provide: UsersService,
                    useValue: {
                        getAllUsers: jest.fn().mockResolvedValue(mockUsers),
                        getUserById: jest.fn(),
                        deleteUserById: jest.fn(),
                    },
                },
            ],
        }).compile();

        usersController = module.get<UsersController>(UsersController);
        usersService = module.get<UsersService>(UsersService);
    });

    describe('getAllUsers', () => {
        it('should return an array of users', async () => {
            const result = await usersController.getAllUsers();
            expect(result).toHaveLength(1);
            expect(result[0].email).toBe('johnDoe@examplemail.com');
        });

        it('should return an empty array if no users found', async () => {
            usersService.getAllUsers = jest.fn().mockResolvedValue([]); //Mock an empty array.

            const result = await usersController.getAllUsers();
            expect(result).toEqual([]);
        });
    });

    describe('getUserById', () => {
        it('should return a user by ID', async () => {
            const mockUser = {
                email: 'johnDoe@examplemail.com',
                username: 'John Doe',
                password: 'hashedPassword',
            };

            usersService.getUserById = jest.fn().mockResolvedValue(mockUser); //Mock a valid user.

            const result = await usersController.getUserById('validUserId');
            expect(result).toEqual(mockUser);
        });

        it('should throw BadRequestException if ID is invalid', async () => {
            usersService.getUserById = jest.fn().mockRejectedValue(new BadRequestException('Invalid user ID')); //Mock an invalid user ID.

            await expect(usersController.getUserById('invalidUserId')).rejects.toThrow(BadRequestException);
        });

        it('should throw NotFoundException if user is not found', async () => {
            usersService.getUserById = jest.fn().mockRejectedValue(new NotFoundException('User with ID not found')); //Mock a missing user ID.

            await expect(usersController.getUserById('nonExistentUserId')).rejects.toThrow(NotFoundException);
        });
    });

    describe('updateUser', () => {
        it('should update a user successfully', async () => {
            const mockUpdateData = {
                email: 'newEmail@examplemail.com',
                username: 'John Updated',
            };

            const mockUpdatedUser = { ...mockUpdateData, password: 'hashedPassword' };

            usersService.updateUser = jest.fn().mockResolvedValue(mockUpdatedUser); //Mock a successful update.

            const result = await usersController.updateUser('validUserId', mockUpdateData);
            expect(result).toEqual(mockUpdatedUser);
        });

        it('should throw BadRequestException if ID is invalid', async () => {
            usersService.updateUser = jest.fn().mockRejectedValue(new BadRequestException('Invalid user ID')); //Mock an invalid user ID.

            await expect(usersController.updateUser('invalidUserId', { email: 'test@example.com' }))
                .rejects.toThrow(BadRequestException);
        });

        it('should throw NotFoundException if user is not found', async () => {
            usersService.updateUser = jest.fn().mockRejectedValue(new NotFoundException('User with ID not found')); //Mock a missing user ID.

            await expect(usersController.updateUser('nonExistentUserId', { email: 'test@example.com' }))
                .rejects.toThrow(NotFoundException);
        });
    });

    describe('deleteUser', () => {
        it('should delete a user by ID successfully', async () => {
            usersService.deleteUserById = jest.fn().mockResolvedValue({ deleted: true }); //Mock successful deletion.

            const result = await usersController.deleteUser('validUserId');
            expect(result).toEqual({ deleted: true });
        });

        it('should throw BadRequestException if ID is invalid', async () => {
            usersService.deleteUserById = jest.fn().mockRejectedValue(new BadRequestException('Invalid user ID')); //Mock an invalid user ID.

            await expect(usersController.deleteUser('invalidUserId')).rejects.toThrow(BadRequestException);
        });

        it('should throw NotFoundException if user is not found', async () => {
            usersService.deleteUserById = jest.fn().mockRejectedValue(new NotFoundException('User with ID not found')); //Mock a missing user ID.

            await expect(usersController.deleteUser('nonExistentUserId')).rejects.toThrow(NotFoundException);
        });
    });
});