import { Game } from '../schemas/Game.schema';
import { ScoreService } from './score.service';

describe('Score service', () => {
  let service: ScoreService;
  beforeEach(() => {
    service = new ScoreService();
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
    it('should update the score of the team', () => {
      const game: Partial<Game> = {
        teamsInfo: [
          { teamName: 'Team A', players: ['player1', 'player2'], score: 60 },
          { teamName: 'Team B', players: ['player1', 'player2'], score: 20 },
        ],
      };
      const teamName = 'Team A';
      const additionalScore = 20;
      service.updateTeamScore(game as Game, teamName, additionalScore);
      const teamA = game.teamsInfo?.find((team) => team.teamName === teamName);
      expect(teamA.score).toBe(80);
    });
  });
});
