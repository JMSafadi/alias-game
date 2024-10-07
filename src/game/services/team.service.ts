import { Injectable } from '@nestjs/common';
import { Game } from '../schemas/Game.schema';

@Injectable()
export class TeamService {
  getNextTeam(game: Game) {
    const teams = game.teamsInfo.map((team) => team.teamName);
    const currentIndex = teams.indexOf(game.currentTurn.teamName);
    return teams[(currentIndex + 1) % teams.length];
  }
}
