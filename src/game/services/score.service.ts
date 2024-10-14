import { Injectable } from '@nestjs/common';
import { LobbyService } from '../../lobby/lobby.service';
import { Game } from '../schemas/Game.schema';

@Injectable()
export class ScoreService {
  constructor(private readonly lobbyService: LobbyService) {}

  calculateScore(game: Game, elapsedTime: number): number {
    const remainingTime = Math.trunc(
      Math.max(0, game.timePerTurn - elapsedTime),
    );
    return remainingTime;
  }

  async updateTeamScore(
    lobbyId: string,
    teamName: string,
    score: number,
  ): Promise<void> {
    // Pobieramy dane lobby
    const lobby = await this.lobbyService.getLobbyById(lobbyId);

    if (!lobby || !lobby.teams) {
      throw new Error('Lobby or teams not found');
    }

    // Znalezienie odpowiedniej drużyny i aktualizacja wyniku
    const team = lobby.teams.find((team) => team.teamName === teamName);
    if (team) {
      team.score = (team.score || 0) + score;
      console.log('score updated: ', team.score);
    }

    // Zapisz zaktualizowane dane lobby
    await lobby.save();
  }
}