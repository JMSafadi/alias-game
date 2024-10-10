import { StartGameDto } from '../dto/start-game.dto';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ScoreService } from './score.service';
import { SimilarityService } from 'src/utils/similarity.service';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Game } from '../schemas/Game.schema';
import { SendMessageDto } from '../dto/send-message.dto';

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

  async getGameById(gameId: string): Promise<Game> {
    if (!mongoose.isValidObjectId(gameId)) {
      throw new BadRequestException('Invalid Game ID format');
    }
    const game = await this.gameModel.findById(gameId).exec();
    if (!game) {
      throw new NotFoundException('Game not found');
    }
    return game;
  }

  async getPlayerRole(gameId: string, playerId: string): Promise<string> {
    const game = await this.getGameById(gameId);

    console.log('Comparing playerId:', playerId);
    console.log('Describer:', game.currentTurn.describer);
    console.log('Guessers:', game.currentTurn.guessers);

    if (game.currentTurn && game.currentTurn.describer === playerId) {
      return 'describer';
    }

    if (game.currentTurn && game.currentTurn.guessers.includes(playerId)) {
      return 'guesser';
    }

    return 'chat';
  }

  async checkWordGuess(
    sendMessageDto: SendMessageDto,
  ): Promise<CheckWordGuessResponse> {
    const { gameId, senderTeamName, content } = sendMessageDto;

    // Pobranie gry na podstawie gameId
    const game = await this.getGameById(gameId);

    // Weryfikacja, czy aktualna drużyna ma prawo zgadywać
    if (game.currentTurn.teamName !== senderTeamName) {
      throw new ForbiddenException('Not your team turn!');
    }

    // Weryfikacja, czy zgadywane słowo jest poprawne
    console.log(`Target word: ${game.currentTurn.wordToGuess.toLowerCase()}`);
    const isCorrect = this.similarityService.checkGuess(
      game.currentTurn.wordToGuess.toLocaleLowerCase(),
      content.toLocaleLowerCase(),
    );
    console.log(`Word guessed (${content}) is correct: ${isCorrect}`);

    if (isCorrect) {
      // Obliczenie wyniku na podstawie pozostałego czasu
      const currentTime = Date.now();
      const elapsedTime = (currentTime - game.currentTurnStartTime) / 1000;

      // Obliczenie wyniku z pozostałym czasem
      const score = this.scoreService.calculateScore(game, elapsedTime);

      // Dodanie punktów do drużyny, zapisanie stanu gry
      this.scoreService.updateTeamScore(game, senderTeamName, score);
      game.currentTurn.isTurnActive = false;

      await game.save();
      return { correct: true, score };
    } else {
      // Odjęcie punktów za błędne zgadnięcie
      this.scoreService.updateTeamScore(game, senderTeamName, -5);
      await game.save();
      return { correct: false };
    }
  }
}
