import { Game } from '../schemas/Game.schema';
import { TeamService } from './team.service';

describe('getNextTeam', () => {
  let service: TeamService;
  beforeEach(() => {
    service = new TeamService();
  });
  it('should return next team name in array', () => {
    const game: Partial<Game> = {
      teamsInfo: [
        { teamName: 'Team A', players: ['player1', 'player2'], score: 60 },
        { teamName: 'Team B', players: ['player1', 'player2'], score: 20 },
      ],
      currentTurn: {
        teamName: 'Team A',
        wordToGuess: 'kangaroo',
        describer: 'player1',
        isTurnActive: true,
      },
    };
    const result = service.getNextTeam(game as Game);
    expect(result).toBe('Team B');
  });
});
