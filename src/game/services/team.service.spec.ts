import { Test, TestingModule } from '@nestjs/testing';
import { TeamService } from './team.service';
import { LobbyService } from '../../lobby/lobby.service';
import { Game } from '../schemas/Game.schema';
import { NotFoundException } from '@nestjs/common';

describe('TeamService', () => {
  let service: TeamService;
  let mockLobbyService: Partial<LobbyService>;

  beforeEach(async () => {
    // Crear un mock de LobbyService
    mockLobbyService = {
      getLobbyById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeamService,
        {
          provide: LobbyService,
          useValue: mockLobbyService,
        },
      ],
    }).compile();

    service = module.get<TeamService>(TeamService);
  });

  describe('getNextTeam', () => {
    it('should return next team name in array', async () => {
      const lobbyId = 'mock-lobby-id'; // Mock de lobbyId
      const currentTeamName = 'Team A'; // Nombre del equipo actual
      const game = {
        teams: [
          { teamName: 'Team A', players: ['player1', 'player2'], score: 60 },
          { teamName: 'Team B', players: ['player1', 'player2'], score: 20 },
        ],
        currentTurn: {
          teamName: 'Team A',
          wordToGuess: 'kangaroo',
          describer: 'player1',
          isTurnActive: true,
          guessers: ['player2'], // Agregar propiedad 'guessers'
        },
      };

      mockLobbyService.getLobbyById = jest.fn().mockResolvedValue(game); // Mock de getLobbyById

      const result = await service.getNextTeam(lobbyId, currentTeamName);
      expect(result).toBe('Team B');
    });

    it('should throw NotFoundException if lobby not found', async () => {
      const lobbyId = 'mock-lobby-id';
      const currentTeamName = 'Team A';

      mockLobbyService.getLobbyById = jest.fn().mockResolvedValue(null); // Mock de lobby no encontrado

      await expect(service.getNextTeam(lobbyId, currentTeamName)).rejects.toThrow(NotFoundException);
    });
  });
});