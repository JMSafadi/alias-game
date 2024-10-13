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
import { Lobby } from 'src/schemas/Lobby.schema';

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

  // Remove the startGame method that uses StartGameDto
  // async startGame(startGameDto: StartGameDto): Promise<Game> {
  //   // Create a new game instance using DTO
  //   const newGame = new this.gameModel(startGameDto);
  //   // Save in database
  //   return await newGame.save();
  // }

  // Add the new method to start a game from lobby data
  async startGameFromLobby(lobby: Lobby): Promise<Game> {
    // Sprawdzenie, czy właściwość `teams` istnieje i czy jest tablicą
    if (
      !lobby.teams ||
      !Array.isArray(lobby.teams) ||
      lobby.teams.length === 0
    ) {
      throw new BadRequestException(
        'Teams are not properly assigned in the lobby',
      );
    }
    // Extract team and player information from the lobby
    const teamsInfo = lobby.teams.map((team) => ({
      teamName: team.teamName,
      players: team.players,
      score: 0,
    }));

    // Initialize the game object using lobby settings
    const newGame = new this.gameModel({
      teamsInfo,
      currentRound: 1,
      rounds: lobby.rounds,
      timePerTurn: lobby.timePerTurn,
      currentTurn: null,
      playingTurn: 0,
      isGameActive: true,
      // Any other necessary game properties
    });

    // Save the game to the database
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

    // Retrieve the game based on gameId
    const game = await this.getGameById(gameId);

    // Verify if the current team has the right to guess
    if (game.currentTurn.teamName !== senderTeamName) {
      throw new ForbiddenException('Not your team turn!');
    }

    // Check if the guessed word is correct
    const isCorrect = this.similarityService.checkGuess(
      game.currentTurn.wordToGuess.toLocaleLowerCase(),
      content.toLocaleLowerCase(),
    );

    if (isCorrect) {
      // Calculate the score based on remaining time
      const currentTime = Date.now();
      const elapsedTime = (currentTime - game.currentTurnStartTime) / 1000;

      // Calculate the score with the remaining time
      const score = this.scoreService.calculateScore(game, elapsedTime);

      // Add points to the team, save the game state
      this.scoreService.updateTeamScore(game, senderTeamName, score);
      game.currentTurn.isTurnActive = false;

      await game.save();
      return { correct: true, score };
    } else {
      // Deduct points for incorrect guess
      this.scoreService.updateTeamScore(game, senderTeamName, -5);
      await game.save();
      return { correct: false };
    }
  }
}
