import { StartGameDto } from '../dto/start-game.dto';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ScoreService } from './score.service';
import { SimilarityService } from '../../utils/similarity.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Game } from '../schemas/Game.schema';

interface CheckWordGuessResponse {
  correct: boolean;
  score?: number;
}

@Injectable()
export class GameService {
  constructor(
    @InjectModel(Game.name) private gameModel: Model<Game>,
    private readonly scoreService: ScoreService,
    private readonly similarityService: SimilarityService,
  ) {}
  async startGame(startGameDto: StartGameDto): Promise<Game> {
    // Create a new game instances using DTO
    const newGame = new this.gameModel(startGameDto);
    // Save in database
    return await newGame.save();
  }
  async checkWordGuess(
    gameId: string,
    teamName: string,
    guessWord: string,
  ): Promise<CheckWordGuessResponse> {
    const game = await this.gameModel.findById(gameId);
    if (!game) {
      throw new NotFoundException('Game not found');
    }
    // Verify if correct team turn
    if (game.currentTurn.teamName !== teamName) {
      throw new ForbiddenException('Not your team turn!');
    }
    // Verify is guess word is correct
    console.log(game.currentTurn.wordToGuess);
    const isCorrect = this.similarityService.checkGuess(
      game.currentTurn.wordToGuess,
      guessWord,
    );
    console.log(`Word ${guessWord} is ${isCorrect}`);
    if (isCorrect) {
      // Calculate score by time remaining
      const currentTime = Date.now();
      const elapsedTime = (currentTime - game.currentTurnStartTime) / 1000;
      // Calculate score with remaining time
      const score = this.scoreService.calculateScore(game, elapsedTime);
      // Find team, add score, save new state and return
      this.scoreService.updateTeamScore(game, teamName, score);
      game.currentTurn.isTurnActive = false;
      await game.save();
      return { correct: true, score };
    } else {
      // Subtract 5 points if incorret guess
      this.scoreService.updateTeamScore(game, teamName, -5);
      game.currentTurn.isTurnActive = false;
      await game.save();
      return { correct: false };
    }
  }
}
