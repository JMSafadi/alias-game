import { Test, TestingModule } from '@nestjs/testing';
import { LobbyService } from './lobby.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Lobby } from '../schemas/Lobby.schema';
import { User } from '../schemas/User.schema';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { JoinLobbyDto } from './dto/JoinLobby.dto';
import * as mongoose from 'mongoose';


const mockLobbyModel = () => ({
    find: jest.fn(),
    findById: jest.fn(),
    findOne: jest.fn(),
    findByIdAndDelete: jest.fn(),
    exec: jest.fn(),
    save: jest.fn(),
    lean: jest.fn(),
    create: jest.fn(),
});
const mockUserModel = () => ({
    findById: jest.fn(),
    find: jest.fn(),
    exec: jest.fn(),
});

describe('LobbyService', () => {
    let service: LobbyService;
    let lobbyModel: Model<Lobby>;
    let userModel: Model<User>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                LobbyService,
                { provide: getModelToken(Lobby.name), useValue: mockLobbyModel() },
                { provide: getModelToken('User'), useValue: mockUserModel() },
            ],
        }).compile();

        service = module.get<LobbyService>(LobbyService);
        lobbyModel = module.get<Model<Lobby>>(getModelToken(Lobby.name));
        userModel = module.get<Model<User>>(getModelToken('User'));
    });

    describe('getAllLobbies', () => {
        it('should return an array of lobbies with user information', async () => {
            const lobbies = [{
                _id: '1',
                ownerId: 'user1',
                playersPerTeam: 2,
                maxPlayers: 4,
                currentPlayers: 2,
                players: [{ userId: 'user1' }],
                toObject: jest.fn().mockReturnValue({ _id: '1', ownerId: 'user1', playersPerTeam: 2, maxPlayers: 4, currentPlayers: 2, players: [{ userId: 'user1' }] })
            }];
            const users = [{ _id: 'user1', username: 'Owner' }];
    
            (lobbyModel.find as jest.Mock).mockReturnValue({ exec: jest.fn().mockResolvedValue(lobbies) });
            (userModel.find as jest.Mock).mockReturnValue({ exec: jest.fn().mockResolvedValue(users) });
    
            const result = await service.getAllLobbies();
            expect(result).toEqual([{
                lobbyID: '1',
                lobbyName: undefined,
                lobbyOwner: 'Owner',
                playersPerTeam: 2,
                maxPlayers: 4,
                currentPlayers: 2,
                players: [{ username: 'Owner', userId: 'user1' }]
            }]);
        });

        it('should throw NotFoundException if no lobbies are found', async () => {
            (lobbyModel.find as jest.Mock).mockReturnValue({ exec: jest.fn().mockResolvedValue([]) });

            await expect(service.getAllLobbies()).rejects.toThrow(NotFoundException);
        });
    });

    describe('getLobbyById', () => {
        it('should return the lobby with user information', async () => {
            const lobby = {
                _id: '507f191e810c19729de860ea',
                ownerId: 'user1',
                players: [{ userId: 'user1' }],
                playersPerTeam: 3,
                maxPlayers: 6,
                currentPlayers: 1,
                rounds: 5,
                timePerTurn: 45,
                teams: 2,
            };
            const users = [{ _id: 'user1', username: 'Owner' }];
        
            (lobbyModel.findById as jest.Mock).mockReturnValue({
                lean: jest.fn().mockResolvedValue(lobby),
            });
            (userModel.find as jest.Mock).mockReturnValue({ exec: jest.fn().mockResolvedValue(users) });
        
            const result = await service.getLobbyById('507f191e810c19729de860ea');
            expect(result).toEqual({
                lobbyId: '507f191e810c19729de860ea',
                lobbyOwner: 'Owner',
                playersPerTeam: 3,
                maxPlayers: 6,
                currentPlayers: 1,
                players: [{ username: 'Owner', userId: 'user1' }],
                rounds: 5,
                timePerTurn: 45,
                teams: 2,
            });
        });

        it('should throw NotFoundException if lobby is not found', async () => {
            (lobbyModel.findById as jest.Mock).mockReturnValue({
                lean: jest.fn().mockResolvedValue(null)
            });

            await expect(service.getLobbyById('507f191e810c19729de860ea')).rejects.toThrow(NotFoundException);
        });

        it('should throw BadRequestException for invalid ID', async () => {
            await expect(service.getLobbyById('invalid-id')).rejects.toThrow(BadRequestException);
        });
    });

    describe('createLobby', () => {
        /*it('should create a new lobby successfully', async () => {
            const validMongoId = '507f191e810c19729de860ea';
            const createLobbyDto = { 
                userId: validMongoId,
                playersPerTeam: 3,
                rounds: 5,
                timePerTurn: 120
            };
            const user = { username: 'Owner' };

            (userModel.findById as jest.Mock).mockResolvedValue(user);
            (lobbyModel.findOne as jest.Mock).mockResolvedValue(null);

            const newLobbyMock = {
                ownerId: validMongoId,
                playersPerTeam: 3,
                maxPlayers: 6,
                currentPlayers: 1,
                players: [{ userId: validMongoId }],
                rounds: 5,
                timePerTurn: 120,
                save: jest.fn().mockResolvedValue({
                    ownerId: validMongoId,
                    playersPerTeam: 3,
                    maxPlayers: 6,
                    currentPlayers: 1,
                    players: [{ userId: validMongoId }],
                    rounds: 5,
                    timePerTurn: 120,
                }),
                toObject: jest.fn().mockReturnValue({
                    ownerId: validMongoId,
                    playersPerTeam: 3,
                    maxPlayers: 6,
                    currentPlayers: 1,
                    players: [{ userId: validMongoId }],
                    rounds: 5,
                    timePerTurn: 120,
                }),
            };

            (lobbyModel.create as jest.Mock).mockResolvedValue(newLobbyMock);

            const result = await service.createLobby(createLobbyDto);

            expect(result).toEqual({
                lobbyOwner: 'Owner',
                playersPerTeam: 3,
                maxPlayers: 6,
                currentPlayers: 1,
                rounds: 5,
                timePerTurn: 120,
                players: [{ username: 'Owner', userId: validMongoId }],
            });
        });*/

        it('should throw NotFoundException if user is not found', async () => {
            const validMongoId = '507f191e810c19729de860ea';
            const createLobbyDto = { 
                userId: validMongoId,
                playersPerTeam: 3 ,
                rounds: 5,
                timePerTurn: 120};

            (userModel.findById as jest.Mock).mockResolvedValue(null);

            await expect(service.createLobby(createLobbyDto)).rejects.toThrow(NotFoundException);
        });

        it('should throw BadRequestException if user is already in another lobby', async () => {
            const validMongoId = '507f191e810c19729de860ea';
            const createLobbyDto = { 
                userId: validMongoId,
                playersPerTeam: 3 ,
                rounds: 5,
                timePerTurn: 120
            };
            const existingLobby = { ownerId: validMongoId };

            (userModel.findById as jest.Mock).mockResolvedValue({ username: 'Owner' });
            (lobbyModel.findOne as jest.Mock).mockResolvedValue(existingLobby);

            await expect(service.createLobby(createLobbyDto)).rejects.toThrow(BadRequestException);
        });
    });

    describe('updateLobby', () => {
        it('should update the lobby information successfully', async () => {
            const lobbyId = '507f191e810c19729de860ea';
            const updateLobbyDto = { playersPerTeam: 4, lobbyName: "New Lobby Name" };
            const lobby = {
                _id: lobbyId,
                currentPlayers: 2,
                playersPerTeam: 3,
                maxPlayers: 6,
                save: jest.fn().mockResolvedValue(true),
            };

            (lobbyModel.findById as jest.Mock).mockResolvedValue(lobby);

            const result = await service.updateLobby(lobbyId, updateLobbyDto);

            expect(lobby.playersPerTeam).toEqual(4);
            expect(lobby.maxPlayers).toEqual(8);
            expect(result).toEqual({ message: `Lobby's information updated successfully.` });
        });

        it('should throw BadRequestException if lobbyId is invalid', async () => {
            const invalidLobbyId = 'invalid-lobby-id';
            const updateLobbyDto = { playersPerTeam: 3 };

            await expect(service.updateLobby(invalidLobbyId, updateLobbyDto)).rejects.toThrow(BadRequestException);
        });

        it('should throw NotFoundException if lobby is not found', async () => {
            const lobbyId = '507f191e810c19729de860ea';
            const updateLobbyDto = { playersPerTeam: 3 };

            (lobbyModel.findById as jest.Mock).mockResolvedValue(null);

            await expect(service.updateLobby(lobbyId, updateLobbyDto)).rejects.toThrow(NotFoundException);
        });

        it('should throw BadRequestException if playersPerTeam * 2 is less than currentPlayers', async () => {
            const lobbyId = '507f191e810c19729de860ea';
            const updateLobbyDto = { playersPerTeam: 2 };
            const lobby = {
                _id: lobbyId,
                currentPlayers: 5,
                playersPerTeam: 3,
                maxPlayers: 6,
                save: jest.fn(),
            };

            (lobbyModel.findById as jest.Mock).mockResolvedValue(lobby);

            await expect(service.updateLobby(lobbyId, updateLobbyDto)).rejects.toThrow(BadRequestException);
        });
    });

    describe('deleteLobbyById', () => {
        it('should delete a lobby successfully and return the correct response', async () => {
            const lobbyId = '507f191e810c19729de860ea';

            const lobby = { _id: lobbyId, lobbyName: 'Test Lobby' };
            (lobbyModel.findByIdAndDelete as jest.Mock).mockResolvedValue(lobby);

            const result = await service.deleteLobbyById(lobbyId);

            expect(result).toEqual({ message: `Lobby with ID ${lobbyId} deleted successfully.` });
            expect(lobbyModel.findByIdAndDelete).toHaveBeenCalledWith(lobbyId);
        });

        it('should throw a BadRequestException if the lobby ID is invalid', async () => {
            const invalidLobbyId = 'invalid-id';

            await expect(service.deleteLobbyById(invalidLobbyId)).rejects.toThrow(
                new BadRequestException(`Invalid lobby ID: ${invalidLobbyId}.`)
            );
        });

        it('should throw a NotFoundException if the lobby does not exist', async () => {
            const lobbyId = '507f191e810c19729de860ea';

            (lobbyModel.findByIdAndDelete as jest.Mock).mockResolvedValue(null);

            await expect(service.deleteLobbyById(lobbyId)).rejects.toThrow(
                new NotFoundException(`Lobby with ID ${lobbyId} not found.`)
            );
            expect(lobbyModel.findByIdAndDelete).toHaveBeenCalledWith(lobbyId);
        });
    });

    describe('joinLobby', () => {
        it('should add a new player to the lobby and return updated lobby details', async () => {
            const joinLobbyDto: JoinLobbyDto = { userId: 'user1', lobbyId: '507f191e810c19729de860ea' };

            const lobby = {
                _id: '507f191e810c19729de860ea',
                players: [{ userId: 'user2' }],
                currentPlayers: 1,
                maxPlayers: 4,
                save: jest.fn().mockResolvedValue({
                    _id: '507f191e810c19729de860ea',
                    players: [{ userId: 'user2' }, { userId: 'user1' }],
                    currentPlayers: 2,
                    maxPlayers: 4,
                    toObject: jest.fn().mockReturnValue({
                        _id: '507f191e810c19729de860ea',
                        ownerId: 'user2',
                        playersPerTeam: 2,
                        maxPlayers: 4,
                        currentPlayers: 2,
                        players: [{ userId: 'user2' }, { userId: 'user1' }],
                    }),
                }),
            };
            const users = [
                { _id: 'user2', username: 'Owner' },
                { _id: 'user1', username: 'New Player' },
            ];

            (lobbyModel.findById as jest.Mock).mockResolvedValue(lobby);
            (userModel.find as jest.Mock).mockReturnValue({ exec: jest.fn().mockResolvedValue(users) });

            const result = await service.joinLobby(joinLobbyDto);

            expect(result).toEqual({
                lobbyID: '507f191e810c19729de860ea',
                lobbyOwner: 'Owner',
                lobbyName: undefined,
                playersPerTeam: 2,
                maxPlayers: 4,
                currentPlayers: 2,
                players: [
                    { username: 'Owner', userId: 'user2' },
                    { username: 'New Player', userId: 'user1' },
                ],
            });
        });

        it('should throw BadRequestException for invalid lobby ID', async () => {
            const joinLobbyDto: JoinLobbyDto = { userId: 'user1', lobbyId: 'invalid-lobby-id' };

            await expect(service.joinLobby(joinLobbyDto)).rejects.toThrow(BadRequestException);
        });

        it('should throw NotFoundException if lobby is not found', async () => {
            const joinLobbyDto: JoinLobbyDto = { userId: 'user1', lobbyId: '507f191e810c19729de860ea' };

            (lobbyModel.findById as jest.Mock).mockResolvedValue(null);

            await expect(service.joinLobby(joinLobbyDto)).rejects.toThrow(NotFoundException);
        });

        it('should throw BadRequestException if user is already in the lobby', async () => {
            const joinLobbyDto: JoinLobbyDto = { userId: 'user1', lobbyId: '507f191e810c19729de860ea' };

            const lobby = {
                _id: '507f191e810c19729de860ea',
                players: [{ userId: 'user1' }],
                currentPlayers: 1,
                maxPlayers: 4,
            };
            (lobbyModel.findById as jest.Mock).mockResolvedValue(lobby);

            await expect(service.joinLobby(joinLobbyDto)).rejects.toThrow(BadRequestException);
        });

        it('should throw BadRequestException if user is already in another lobby', async () => {
            const joinLobbyDto: JoinLobbyDto = { userId: 'user1', lobbyId: '507f191e810c19729de860ea' };

            const lobby = {
                _id: '507f191e810c19729de860ea',
                players: [{ userId: 'user2' }],
                currentPlayers: 1,
                maxPlayers: 4,
            };
            const existingLobby = {
                _id: '507f191e810c19729de860ea',
                players: [{ userId: 'user1' }],
            };

            (lobbyModel.findById as jest.Mock).mockResolvedValue(lobby);
            (lobbyModel.findOne as jest.Mock).mockResolvedValue(existingLobby);

            await expect(service.joinLobby(joinLobbyDto)).rejects.toThrow(BadRequestException);
        });

        it('should throw BadRequestException if the lobby is full', async () => {
            const joinLobbyDto: JoinLobbyDto = { userId: 'user1', lobbyId: '507f191e810c19729de860ea' };

            const lobby = {
                _id: '507f191e810c19729de860ea',
                players: [{ userId: 'user2' }],
                currentPlayers: 4,
                maxPlayers: 4,
            };

            (lobbyModel.findById as jest.Mock).mockResolvedValue(lobby);

            await expect(service.joinLobby(joinLobbyDto)).rejects.toThrow(BadRequestException);
        });
    });

    describe('assignTeams', () => {
        it('should assign teams successfully and return the correct response', async () => {
            const assignTeamsDto = {
                lobbyId: '507f191e810c19729de860ea',
                teams: [
                    { teamName: 'Team1', players: ['user1'] },
                    { teamName: 'Team2', players: ['user2'] },
                ],
            };
    
            const lobby = {
                _id: '507f191e810c19729de860ea',
                players: [{ userId: 'user1' }, { userId: 'user2' }],
                currentPlayers: 2,
                maxPlayers: 2,
                save: jest.fn().mockResolvedValue(true),
            };
    
            const users = [
                { _id: 'user1', username: 'user1' },
                { _id: 'user2', username: 'user2' },
            ];
    
            (lobbyModel.findById as jest.Mock).mockResolvedValue(lobby);
            (userModel.find as jest.Mock).mockReturnValue({
                exec: jest.fn().mockResolvedValue(users),
            });
    
            const result = await service.assignTeams(assignTeamsDto);
    
            expect(result).toEqual({
                lobbyId: lobby._id.toString(),
                teams: assignTeamsDto.teams,
                message: 'Teams assigned successfully. The game is ready to start!',
            });
            expect(lobby.save).toHaveBeenCalled();
            expect(userModel.find).toHaveBeenCalledWith(
                { _id: { $in: ['user1', 'user2'] } },
                'username'
            );
        });
    
        it('should throw BadRequestException for invalid lobby ID', async () => {
            const assignTeamsDto = {
                lobbyId: 'invalid-lobby-id',
                teams: [{ teamName: 'Team1', players: ['user1'] }],
            };
    
            await expect(service.assignTeams(assignTeamsDto)).rejects.toThrow(BadRequestException);
        });
    
        it('should throw NotFoundException if lobby is not found', async () => {
            const assignTeamsDto = {
                lobbyId: '507f191e810c19729de860ea',
                teams: [{ teamName: 'Team1', players: ['user1'] }],
            };
    
            (lobbyModel.findById as jest.Mock).mockResolvedValue(null);
    
            await expect(service.assignTeams(assignTeamsDto)).rejects.toThrow(NotFoundException);
        });
    
        it('should throw BadRequestException if some players are not in the lobby', async () => {
            const assignTeamsDto = {
                lobbyId: '507f191e810c19729de860ea',
                teams: [{ teamName: 'Team1', players: ['user1', 'user2'] }],
            };
    
            const lobby = {
                _id: '507f191e810c19729de860ea',
                players: [{ userId: 'user1' }],
                currentPlayers: 1,
                maxPlayers: 4,
            };
    
            (lobbyModel.findById as jest.Mock).mockResolvedValue(lobby);
    
            await expect(service.assignTeams(assignTeamsDto)).rejects.toThrow(
                new BadRequestException('Invalid Team Assignment: Some players are not in the lobby.')
            );
        });
    
        it('should throw BadRequestException if the number of players does not match the lobby', async () => {
            const assignTeamsDto = {
                lobbyId: '507f191e810c19729de860ea',
                teams: [{ teamName: 'Team1', players: ['user1'] }],
            };
    
            const lobby = {
                _id: '507f191e810c19729de860ea',
                players: [{ userId: 'user1' }],
                currentPlayers: 2,
                maxPlayers: 4,
            };
    
            (lobbyModel.findById as jest.Mock).mockResolvedValue(lobby);
    
            await expect(service.assignTeams(assignTeamsDto)).rejects.toThrow(
                new BadRequestException('Invalid Team Assignment: Incorrect number of players.')
            );
        });
    
        it('should throw BadRequestException if the number of players in the teams does not match currentPlayers', async () => {
            const assignTeamsDto = {
                lobbyId: '507f191e810c19729de860ea',
                teams: [{ teamName: 'Team1', players: ['user1'] }],
            };
        
            const lobby = {
                _id: '507f191e810c19729de860ea',
                players: [{ userId: 'user1' }, { userId: 'user2' }],
                currentPlayers: 2,
                maxPlayers: 4,
                save: jest.fn().mockResolvedValue(true),
            };
        
            (lobbyModel.findById as jest.Mock).mockResolvedValue(lobby);
        
            (userModel.find as jest.Mock).mockReturnValue({
                exec: jest.fn().mockResolvedValue([]),
            });
        
            await expect(service.assignTeams(assignTeamsDto)).rejects.toThrow(
                new BadRequestException('Invalid Team Assignment: Incorrect number of players.')
            );
        });
        
    });    
});