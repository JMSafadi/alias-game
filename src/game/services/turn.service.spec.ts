import { WordService } from './words.service';
import { Model } from 'mongoose';
import { Game } from '../schemas/Game.schema';
import { TeamService } from './team.service';
import { TurnService } from './turn.service';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { LobbyService } from '../../lobby/lobby.service';
import { UsersService } from '../../users/users.service';

describe('Turn Service', () => {
  let turnService: TurnService;
  let gameModel: Model<Game> & { save: jest.Mock };
  let teamService: TeamService;
  let wordService: WordService;
  let lobbyService: LobbyService;
  let userService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TurnService,
        {
          provide: getModelToken(Game.name),
          useValue: {
            findById: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: TeamService,
          useValue: {
            getNextTeam: jest.fn(),
          },
        },
        {
          provide: WordService,
          useValue: {
            generateWord: jest.fn(),
          },
        },
        {
          provide: LobbyService,
          useValue: {
            getLobbyById: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            getUsernamesByIds: jest.fn(),
          },
        },
      ],
    }).compile();

    turnService = module.get<TurnService>(TurnService);
    gameModel = module.get<Model<Game> & { save: jest.Mock }>(
      getModelToken(Game.name),
    );
    teamService = module.get<TeamService>(TeamService);
    wordService = module.get<WordService>(WordService);
    lobbyService = module.get<LobbyService>(LobbyService);
    userService = module.get<UsersService>(UsersService);
  });

  it('Should be defined', () => {
    expect(turnService).toBeDefined();
  });

  describe('startTurn', () => {
    it('Should throw NotFoundException if game is not found', async () => {
      jest.spyOn(gameModel, 'findById').mockResolvedValue(null);
      await expect(
        turnService.startTurn({ gameId: '1', teamName: 'Team A' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('Should start turn and save new game state', async () => {
      const mockGame = {
        currentRound: 0,
        playingTurn: 0,
        teamsInfo: [
          { teamName: 'Team A', players: ['user1', 'user2'], score: 0 },
          { teamName: 'Team B', players: ['user2', 'user3'], score: 0 },
        ],
        currentTurn: {
          teamName: 'Team A',
          wordToGuess: 'owl',
        },
        lobbyId: 'lobbyId',
        save: jest.fn(),
      };
    
      jest.spyOn(gameModel, 'findById').mockResolvedValue(mockGame);
      jest.spyOn(wordService, 'generateWord').mockReturnValue('owl');
    
      jest.spyOn(lobbyService, 'getLobbyById').mockResolvedValue({
        id: 'lobbyId',
        teams: [
          { teamName: 'Team A', players: ['user1', 'user2'] },
          { teamName: 'Team B', players: ['user2', 'user3'] },
        ],
      });
    
      // Mockeando el método getUsernamesByIds
      jest.spyOn(userService, 'getUsernamesByIds').mockResolvedValue(['user1', 'user2', 'user3']);
    
      const result = await turnService.startTurn({
        gameId: '1',
        teamName: 'Team A',
      });
    
      expect(result).toEqual(mockGame);
      expect(mockGame.currentRound).toBe(1);
      expect(mockGame.playingTurn).toBe(1);
      expect(mockGame.currentTurn.teamName).toBe('Team A');
      expect(mockGame.currentTurn.wordToGuess).toBe('owl');
      expect(mockGame.save).toHaveBeenCalled();
    });
    
  });
  
  describe('endTurn', () => {
    it('Should throw NotFoundException if game is not found', async () => {
      jest.spyOn(gameModel, 'findById').mockResolvedValue(null);
      await expect(turnService.endTurn('1')).rejects.toThrow(NotFoundException);
    });

    it('Should end turn and save new game state', async () => {
      const mockGame = {
        currentTurn: { isTurnActive: true },
        save: jest.fn(),
      };

      jest.spyOn(gameModel, 'findById').mockResolvedValue(mockGame);
      const result = await turnService.endTurn('1');

      expect(result).toEqual(mockGame);
      expect(mockGame.currentTurn.isTurnActive).toBe(false);
      expect(mockGame.save).toHaveBeenCalled();
    });
  });

  describe('startNextTurn', () => {
    it('Should throw NotFoundException if game is not found', async () => {
      jest.spyOn(gameModel, 'findById').mockResolvedValue(null);
      await expect(turnService.startNextTurn('1')).rejects.toThrow(
        NotFoundException,
      );
    });
  
describe('startNextTurn', () => {
  it('Should throw NotFoundException if game is not found', async () => {
    jest.spyOn(gameModel, 'findById').mockResolvedValue(null);
    await expect(turnService.startNextTurn('1')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('Should update to next turn and save new game state', async () => {
    const mockGame = {
      currentRound: 1,
      rounds: 3,
      playingTurn: 1,
      teamsInfo: [
        { teamName: 'Team A', players: ['user1', 'user2'], score: 0 },
        { teamName: 'Team B', players: ['user2', 'user3'], score: 0 },
      ],
      currentTurnStartTime: Date.now(),
      save: jest.fn(),
      lobbyId: 'lobbyId',
      currentTurn: {
        teamName: 'Team B',
        wordToGuess: 'cat',
      },
    };

    jest.spyOn(gameModel, 'findById').mockResolvedValue(mockGame);
    
    jest.spyOn(teamService, 'getNextTeam').mockResolvedValue('Team B');
    
    jest.spyOn(wordService, 'generateWord').mockReturnValue('cat');

    jest.spyOn(lobbyService, 'getLobbyById').mockResolvedValue({
      id: 'lobbyId',
      teams: [
        { teamName: 'Team A', players: ['user1', 'user2'] },
        { teamName: 'Team B', players: ['user2', 'user3'] },
      ],
    });


    jest.spyOn(userService, 'getUsernamesByIds').mockResolvedValue(['user1', 'user2', 'user3']);

    const result = await turnService.startNextTurn('1');

    expect(result.gameOver).toBe(false);
    expect(mockGame.playingTurn).toBe(2);
    expect(mockGame.currentTurn.teamName).toBe('Team B');
    expect(mockGame.currentTurn.wordToGuess).toBe('cat');
    expect(mockGame.save).toHaveBeenCalled();
  });
}); 
});
});