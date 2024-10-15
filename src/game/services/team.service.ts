import { Injectable, NotFoundException } from '@nestjs/common';
import { LobbyService } from '../../lobby/lobby.service';

@Injectable()
export class TeamService {
  constructor(private readonly lobbyService: LobbyService) {}

  async getNextTeam(lobbyId: string, currentTeamName: string): Promise<string> {
    const lobby = await this.lobbyService.getLobbyById(lobbyId);
    if (!lobby) {
      throw new NotFoundException('Lobby not found');
    }

    const teams = lobby.teams.map((team) => team.teamName);
    const currentIndex = teams.indexOf(currentTeamName);
    return teams[(currentIndex + 1) % teams.length];
  }
}