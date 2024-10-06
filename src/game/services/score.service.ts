import { Injectable } from '@nestjs/common';
import { Game } from '../schemas/Game.schema';

@Injectable()
export class ScoreService {
  calculateScore(game: Game, elapsedTime: number) {
    const remainingTime = Math.trunc(
      Math.max(0, game.timePerTurn - elapsedTime),
    );
    return remainingTime;
  }
  updateTeamScore(game: Game, teamName: string, score: number) {
    const team = game.teamsInfo.find((team) => team.teamName === teamName);
    if (team) {
      team.score += score;
      console.log('score updated: ', team.score);
    }
  }
}
