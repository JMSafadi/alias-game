import { Test, TestingModule } from '@nestjs/testing';
import { LobbyController } from './lobby.controller';
import { LobbyService } from './lobby.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateLobbyDto } from './dto/CreateLobby.dto';
import { UpdateLobbyDto } from './dto/UpdateLobby.dto';
import { JoinLobbyDto } from './dto/JoinLobby.dto';
import { AssignTeamsDto } from './dto/AssignTeams.dto';

describe('LobbyController', () => {
    let lobbyController: LobbyController;
    let lobbyService: LobbyService;

    beforeEach(async () => {
        const mockLobbies = [
            {
                ownerId: 'ownerId1',
                lobbyName: 'Lobby 1',
                playersPerTeam: 2,
                maxPlayers: 4,
                currentPlayers: 1,
                players: [],
                teamCount: 2,
            },
        ];

        const module: TestingModule = await Test.createTestingModule({
            controllers: [LobbyController],
            providers: [
                {
                    provide: LobbyService,
                    useValue: {
                        getAllLobbies: jest.fn().mockResolvedValue(mockLobbies),
                        getLobbyById: jest.fn(),
                        createLobby: jest.fn(),
                        updateLobby: jest.fn(),
                        joinLobby: jest.fn(),
                        assignTeams: jest.fn(),
                        deleteLobbyById: jest.fn(),
                    },
                },
            ],
        }).compile();

        lobbyController = module.get<LobbyController>(LobbyController);
        lobbyService = module.get<LobbyService>(LobbyService);
    });

    describe('getAllLobbies', () => {
        it('should return an array of lobbies', async () => {
            const result = await lobbyController.getAllLobbies();
            expect(result).toHaveLength(1);
            expect(result[0].lobbyName).toBe('Lobby 1');
        });

        it('should return an empty array if no lobbies found', async () => {
            lobbyService.getAllLobbies = jest.fn().mockResolvedValue([]); //Mock an empty array.
            const result = await lobbyController.getAllLobbies();
            expect(result).toEqual([]);
        });
    });

    describe('getLobbyById', () => {
        it('should return a lobby by ID', async () => {
            const mockLobby = {
                ownerId: 'ownerId1',
                lobbyName: 'Lobby 1',
                playersPerTeam: 2,
                maxPlayers: 4,
                currentPlayers: 1,
                players: [],
                teamCount: 2,
            };

            lobbyService.getLobbyById = jest.fn().mockResolvedValue(mockLobby); //Mock a valid lobby.

            const result = await lobbyController.getLobbyById('validLobbyId');
            expect(result).toEqual(mockLobby);
        });

        it('should throw BadRequestException if ID is invalid', async () => {
            lobbyService.getLobbyById = jest.fn().mockRejectedValue(new BadRequestException('Invalid lobby ID')); //Mock invalid ID.

            await expect(lobbyController.getLobbyById('invalidLobbyId')).rejects.toThrow(BadRequestException);
        });

        it('should throw NotFoundException if lobby is not found', async () => {
            lobbyService.getLobbyById = jest.fn().mockRejectedValue(new NotFoundException('Lobby with ID not found')); //Mock a missing user ID.

            await expect(lobbyController.getLobbyById('nonExistentLobbyId')).rejects.toThrow(NotFoundException);
        });
    });

    describe('createLobby', () => {
        it('should create a new lobby', async () => {
            const createLobbyDto: CreateLobbyDto = {
                userId: "validID",
                playersPerTeam: 3,
            };

            const mockCreatedLobby = {
                ...createLobbyDto,
                currentPlayers: 1,
                players: [],
            };

            lobbyService.createLobby = jest.fn().mockResolvedValue(mockCreatedLobby); //Mock successful creation.

            const result = await lobbyController.createLobby(createLobbyDto);
            expect(result).toEqual(mockCreatedLobby);
        });

        it('should throw BadRequestException if lobby data is invalid', async () => {
            const createLobbyDto: CreateLobbyDto = {
                userId: "notValidID",
                playersPerTeam: 3,
            };

            lobbyService.createLobby = jest.fn().mockRejectedValue(new BadRequestException('Invalid lobby data')); //Mock invalid data.

            await expect(lobbyController.createLobby(createLobbyDto)).rejects.toThrow(BadRequestException);
        });
    });

    describe('updateLobby', () => {
        it('should update a lobby successfully', async () => {
            const updateLobbyDto: UpdateLobbyDto = {
                lobbyName: 'Updated Lobby',
                playersPerTeam: 3,
                maxPlayers: 5,
            };

            lobbyService.updateLobby = jest.fn().mockResolvedValue({ ...updateLobbyDto, id: 'validLobbyId' });

            const result = await lobbyController.updateLobby('validLobbyId', updateLobbyDto);
            expect(result).toEqual({ ...updateLobbyDto, id: 'validLobbyId' });
        });

        it('should throw NotFoundException if lobby is not found', async () => {
            const updateLobbyDto: UpdateLobbyDto = {
                lobbyName: 'Updated Lobby',
                playersPerTeam: 3,
                maxPlayers: 6,
            };

            lobbyService.updateLobby = jest.fn().mockRejectedValue(new NotFoundException('Lobby with ID not found'));

            await expect(lobbyController.updateLobby('nonExistentLobbyId', updateLobbyDto)).rejects.toThrow(NotFoundException);
        });

        it('should throw BadRequestException if invalid data is provided', async () => {
            const updateLobbyDto: UpdateLobbyDto = {
                lobbyName: 'Updated Lobby',
                playersPerTeam: 6, // Invalid playersPerTeam
                maxPlayers: 5,
            };

            lobbyService.updateLobby = jest.fn().mockRejectedValue(new BadRequestException('Invalid data'));

            await expect(lobbyController.updateLobby('validLobbyId', updateLobbyDto)).rejects.toThrow(BadRequestException);
        });
    });

    describe('deleteLobby', () => {
        it('should delete a lobby by ID', async () => {
            const validLobbyId = 'validLobbyId';
            lobbyService.deleteLobbyById = jest.fn().mockResolvedValue({ success: true, message: 'Lobby deleted successfully' });

            const result = await lobbyController.deleteLobby(validLobbyId);
            expect(result).toEqual({ success: true, message: 'Lobby deleted successfully' });
            expect(lobbyService.deleteLobbyById).toHaveBeenCalledWith(validLobbyId); //Verify method was called with correct ID.
        });

        it('should throw NotFoundException if the lobby does not exist', async () => {
            const nonExistentLobbyId = 'nonExistentLobbyId';
            lobbyService.deleteLobbyById = jest.fn().mockRejectedValue(new NotFoundException('Lobby with ID not found'));

            await expect(lobbyController.deleteLobby(nonExistentLobbyId)).rejects.toThrow(NotFoundException);
        });

        it('should throw BadRequestException if ID is invalid', async () => {
            const invalidLobbyId = 'invalidLobbyId';
            lobbyService.deleteLobbyById = jest.fn().mockRejectedValue(new BadRequestException('Invalid lobby ID'));

            await expect(lobbyController.deleteLobby(invalidLobbyId)).rejects.toThrow(BadRequestException);
        });
    });

    describe('joinLobby', () => {
        it('should allow a user to join a lobby', async () => {
            const joinLobbyDto: JoinLobbyDto = {
                userId: 'userId1',
                lobbyId: 'validLobbyId',
            };

            const mockJoinResponse = { success: true, message: 'User joined the lobby' };

            lobbyService.joinLobby = jest.fn().mockResolvedValue(mockJoinResponse); // Mock successful join.

            const result = await lobbyController.joinLobby(joinLobbyDto);
            expect(result).toEqual(mockJoinResponse);
        });

        it('should throw NotFoundException if the lobby does not exist', async () => {
            const joinLobbyDto: JoinLobbyDto = {
                userId: 'userId1',
                lobbyId: 'nonExistentLobbyId',
            };

            lobbyService.joinLobby = jest.fn().mockRejectedValue(new NotFoundException('Lobby with ID not found'));

            await expect(lobbyController.joinLobby(joinLobbyDto)).rejects.toThrow(NotFoundException);
        });

        it('should throw BadRequestException if the join data is invalid', async () => {
            const joinLobbyDto: JoinLobbyDto = {
                userId: '', // Invalid userId
                lobbyId: 'validLobbyId',
            };

            lobbyService.joinLobby = jest.fn().mockRejectedValue(new BadRequestException('Invalid join data'));

            await expect(lobbyController.joinLobby(joinLobbyDto)).rejects.toThrow(BadRequestException);
        });
    });

    describe('assignTeams', () => {
        it('should assign players to teams successfully', async () => {
            const assignTeamsDto: AssignTeamsDto = {
                lobbyId: 'validLobbyId',
                teams: [
                    {
                        teamName: 'Team A',
                        players: ['player1', 'player2'],
                    },
                    {
                        teamName: 'Team B',
                        players: ['player3', 'player4'],
                    },
                ],
            };

            const mockAssignResponse = { success: true, message: 'Teams assigned successfully' };

            lobbyService.assignTeams = jest.fn().mockResolvedValue(mockAssignResponse); // Mock successful assignment.

            const result = await lobbyController.assignTeams(assignTeamsDto);
            expect(result).toEqual(mockAssignResponse);
        });

        it('should throw NotFoundException if the lobby does not exist', async () => {
            const assignTeamsDto: AssignTeamsDto = {
                lobbyId: 'nonExistentLobbyId',
                teams: [
                    {
                        teamName: 'Team A',
                        players: ['player1', 'player2'],
                    },
                ],
            };

            lobbyService.assignTeams = jest.fn().mockRejectedValue(new NotFoundException('Lobby with ID not found'));

            await expect(lobbyController.assignTeams(assignTeamsDto)).rejects.toThrow(NotFoundException);
        });

        it('should throw BadRequestException if the assignment data is invalid', async () => {
            const assignTeamsDto: AssignTeamsDto = {
                lobbyId: 'validLobbyId',
                teams: [
                    {
                        teamName: '', // Invalid teamName
                        players: ['player1', 'player2'],
                    },
                ],
            };

            lobbyService.assignTeams = jest.fn().mockRejectedValue(new BadRequestException('Invalid assignment data'));

            await expect(lobbyController.assignTeams(assignTeamsDto)).rejects.toThrow(BadRequestException);
        });
    });
});