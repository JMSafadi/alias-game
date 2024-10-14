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

  describe('updateTeamScore', () => {
    it('should update the score of the team', async () => {
      const lobbyId = 'mock-lobby-id';
      const game = {
        teams: [
          { teamName: 'Team A', players: ['player1', 'player2'], score: 60 },
          { teamName: 'Team B', players: ['player1', 'player2'], score: 20 },
        ],
        save: jest.fn(),
      };

      mockLobbyService.getLobbyById = jest.fn().mockResolvedValue(game);

      const teamName = 'Team A';
      const additionalScore = 20;

      await service.updateTeamScore(lobbyId, teamName, additionalScore);
      
      const teamA = game.teams.find((team) => team.teamName === teamName);
      expect(teamA.score).toBe(80);
      expect(game.save).toHaveBeenCalled();
    });
  });
});