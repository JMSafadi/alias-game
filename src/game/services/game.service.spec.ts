/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { ScoreService } from '../services/score.service';
import { Game } from '../schemas/Game.schema';
import { GameService } from '../services/game.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

describe('Game Service', () => {
  let gameService: GameService;
  let gameModel: Model<Game> & { save: jest.Mock };
  let scoreService: ScoreService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GameService,
        {
          provide: getModelToken(Game.name),
          useValue: {
            new: jest.fn().mockImplementation((dto) => ({
              ...dto,
              save: jest.fn().mockResolvedValue(dto)
            })),
            findById: jest.fn(),
          },
        },
        {
          provide: ScoreService,
          useValue: {
            calculateScore: jest.fn(),
            updateTeamScore: jest.fn(),
          },
        },
      ],
    }).compile();
    gameService = module.get<GameService>(GameService);
    gameModel = module.get<Model<Game> & { save: jest.Mock }>(getModelToken(Game.name));
    scoreService = module.get<ScoreService>(ScoreService);
  });

  it('Should be defined', () => {
    expect(gameService).toBeDefined();
  });

  describe('startGame', () => {
    // it('Should start and save a new game', async () => {
    //   // LobbyID ?
    //   const startGameDto = {
    //     lobbyId: '123',
    //     teamsInfo: [
    //       {
    //         teamName: 'Team A',
    //         players: ['Player 1', 'Player 2'],
    //       },
    //       {
    //         teamName: 'Team B',
    //         players: ['Player 3', 'Player 4'],
    //       },
    //     ],
    //     rounds: 5,
    //     timePerTurn: 30,
    //   };
    //   const mockGameInstance = new gameModel(startGameDto);
    //   jest.spyOn(mockGameInstance, 'save').mockResolvedValue(mockGameInstance);
    //   const result = await gameService.startGame(startGameDto);
    //   expect(result).toEqual(startGameDto);
    //   expect(gameModel.save).toHaveBeenCalled();
    // });
  });
  describe('checkWordGuess', () => {
    it('Should throw NotFoundException if game is not found', async () => {
      jest.spyOn(gameModel, 'findById').mockResolvedValue(null);
      await expect(gameService.checkWordGuess('1', 'Team A', 'owl')).rejects.toThrow(NotFoundException);
    });
    it('Should throw FrobiddenException if it nnot the team\'s turn', async () => {
      const mockGame = {
        currentTurn: { teamName: 'Team B', wordToGuess: 'owl', isTurnActive: true }
      };
      jest.spyOn(gameModel, 'findById').mockResolvedValue(mockGame as any);
      await expect(gameService.checkWordGuess('1', 'Team A', 'owl')).rejects.toThrow(ForbiddenException);
    });
  });
  it('Should return true: correct and score if the guess is correct', async () => {
    const mockGame = {
      currentTurn: { teamName: 'Team A', wordToGuess: 'owl', isTurnActive: true },
      currentTurnStartTime: Date.now() - 5000,
      timerPerTurn: 30,
      save: jest.fn()
    };
    jest.spyOn(gameModel, 'findById').mockResolvedValue(mockGame as any);
    jest.spyOn(scoreService, 'calculateScore').mockReturnValue(25);
    const result = await gameService.checkWordGuess('1', 'Team A', 'owl');
    expect(result).toEqual({ correct: true, score: 25 });
    expect(scoreService.updateTeamScore).toHaveBeenCalledWith(mockGame, 'Team A', 25);
  });
  it('Should return correct: false and subtract 5 points if the guess is incorrect', async () => {
    const mockGame = {
      currentTurn: { teamName: 'Team A', wordToGuess: 'owl', isTurnActive: true },
      currentTurnStartTime: Date.now(),
      timerPerTurn: 30,
      save: jest.fn()
    };
    jest.spyOn(gameModel, 'findById').mockResolvedValue(mockGame as any);
    const result = await gameService.checkWordGuess('1', 'Team A', 'cat');
    expect(result).toEqual({ correct: false });
    expect(scoreService.updateTeamScore).toHaveBeenCalledWith(mockGame, 'Team A', -5);
  });
});
