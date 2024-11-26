import { Game } from './../schemas/Game.schema';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ScoreService {
  constructor() {}
  // Calculate score method
  calculateScore(game: Game, elapsedTime: number): number {
    const remainingTime = Math.trunc(
      Math.max(0, game.timePerTurn - elapsedTime),
    );
    return remainingTime;
  }
}
