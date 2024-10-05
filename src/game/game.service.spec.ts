import { Test, TestingModule } from "@nestjs/testing";
import { GameService } from "./services/game.service";
import { getModelToken } from "@nestjs/mongoose";
import { Game } from "./schemas/game.schema";
import { Model } from "mongoose";

describe('Game Service', () => {
  let service: GameService
  let model: Model<Game>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GameService,
        {
          provide: getModelToken(Game.name),
          useValue: {
            findById: jest.fn(),
            new: jest.fn().mockResolvedValue({}),
            constructor: jest.fn().mockResolvedValue({}),
            create: jest.fn().mockResolvedValue({}),
            save: jest.fn()
          },
        },
      ],
    }).compile()
  
    service = module.get<GameService>(GameService)
    model = module.get<Model<Game>>(getModelToken(Game.name))
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('start game', () => {
    it('should create a new game', async () => {
      // Mock game data
      const startGameDto = {
        lobbyId: '123',
        teamsInfo: [
          { teamName: 'Team A', players: ['player1', 'player2'] },
          { teamName: 'Team B', players: ['player3', 'player4'] }
        ],
        rounds: 10,
        timePerTurn: 60
      }

      const mockGame = { save: jest.fn().mockResolvedValue({}) }
      // jest.spyOn(model, 'create').mockResolvedValue(mockGame)

      const result = await service.startGame(startGameDto)
      expect(result).toBeDefined()
      expect(model.create).toHaveBeenCalledWith(startGameDto)
      expect(mockGame.save).toHaveBeenCalled()
    })
  })
  describe('start game turn for one team', async () => {
    // Mock game turn data
    const startTurnDto = {
      gameId: '456',
      teamName: 'Team A'
    }

    const mockGame = {
      teamsInfo: [
        { teamName: 'Team A', players: ['player1', 'player2'] },
        { teamName: 'Team B', players: ['player3', 'player4'] },
      ],
      currentTurn: null,
      save: jest.fn().mockResolvedValue({})
    }

    jest.spyOn(model, 'findById').mockResolvedValue(mockGame)

    const result = await service.startTurn(startTurnDto)
    expect(result).toBeDefined()
    expect(result.currentTurn).toBeDefined()
    expect(result.currentTurn.teamName).toBe('Team A')
    expect(mockGame.save).toHaveBeenCalled()
  })
})