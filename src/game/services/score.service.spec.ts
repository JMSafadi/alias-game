import { Test, TestingModule } from '@nestjs/testing';
import { ScoreService } from './score.service';
import { LobbyService } from '../../lobby/lobby.service';
import { Game } from '../schemas/Game.schema';

describe('ScoreService', () => {
  let service: ScoreService;
  let mockLobbyService: Partial<LobbyService>;

  beforeEach(async () => {
    mockLobbyService = {
      getLobbyById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScoreService,
        {
          provide: LobbyService,
          useValue: mockLobbyService,
        },
      ],
    }).compile();

    service = module.get<ScoreService>(ScoreService);
  });

  describe('calculateScore', () => {
    it('should return the remaining time when elapsed time is lower than time per turn', () => {
      const game: Partial<Game> = { timePerTurn: 60 };
      const elapsedTime = 30;
      const result = service.calculateScore(game as Game, elapsedTime);
      expect(result).toBe(30);
    });
  });
});