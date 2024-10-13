import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ScoreService } from './score.service';
import { SimilarityService } from '../../utils/similarity.service';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Game } from '../schemas/Game.schema';
import { SendMessageDto } from '../dto/send-message.dto';
import { LobbyService } from 'src/lobby/lobby.service';
import { Lobby } from 'src/schemas/Lobby.schema';

interface CheckWordGuessResponse {
  correct: boolean;
  score?: number;
}

@Injectable()
export class GameService {
  constructor(
    @InjectModel(Game.name) private gameModel: Model<Game>,
    private readonly lobbyService: LobbyService,
    private readonly scoreService: ScoreService,
    private readonly similarityService: SimilarityService,
  ) {}

  // Metoda do uruchamiania gry na podstawie danych lobby
  async startGameFromLobby(lobby: Lobby): Promise<Game> {
    // const lobbyObject = lobby.toObject();
    if (
      !lobby.teams ||
      !Array.isArray(lobby.teams) ||
      lobby.teams.length < 2 ||
      lobby.teams.some(
        (team) =>
          !team.teamName ||
          !Array.isArray(team.players) ||
          team.players.length === 0,
      )
    ) {
      console.log('Teams are not properly assigned:', lobby.teams);
      throw new BadRequestException(
        'Teams are not properly assigned in the lobby',
      );
    }

    console.log('Lobby teams in startGameFromLobby:', lobby.teams);

    lobby.teams.forEach((team, index) => {
      console.log(`Team ${index + 1}:`, team);
    });

    const newGame = new this.gameModel({
      lobbyId: lobby._id,
      currentRound: 1,
      rounds: lobby.rounds,
      timePerTurn: lobby.timePerTurn,
      currentTurn: null,
      playingTurn: 0,
      isGameActive: true,
      teamsInfo: lobby.teams.map((team) => ({
        teamName: team.teamName,
        players: team.players,
        score: 0,
      })),
    });

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

    const lobby = await this.lobbyService.getLobbyById(game.lobbyId);
    if (!lobby) {
      throw new NotFoundException('Lobby not found');
    }

    const currentTurn = game.currentTurn;

    if (currentTurn && currentTurn.describer === playerId) {
      return 'describer';
    }

    if (currentTurn && lobby.teams) {
      const guessers = lobby.teams
        .flatMap((team) =>
          team.teamName === currentTurn.teamName ? team.players : [],
        )
        .filter((player) => player !== currentTurn.describer);

      if (guessers.includes(playerId)) {
        return 'guesser';
      }
    }

    return 'chat';
  }

  async checkWordGuess(
    sendMessageDto: SendMessageDto,
  ): Promise<CheckWordGuessResponse> {
    const { gameId, senderTeamName, content } = sendMessageDto;

    // Retrieve the game based on gameId
    const game = await this.getGameById(gameId);

    const lobby = await this.lobbyService.getLobbyById(game.lobbyId);
    if (!lobby) {
      throw new NotFoundException('Lobby not found');
    }

    // Verify if the current team has the right to guess
    if (game.currentTurn.teamName !== senderTeamName) {
      throw new ForbiddenException('Not your team turn!');
    }

    // Check if the guessed word is correct
    const isCorrect = this.similarityService.checkGuess(
      game.currentTurn.wordToGuess,
      content,
    );

    if (isCorrect) {
      // Calculate the score based on remaining time
      const currentTime = Date.now();
      const elapsedTime = (currentTime - game.currentTurnStartTime) / 1000;

      // Calculate the score with the remaining time
      const score = this.scoreService.calculateScore(game, elapsedTime);

      // Add points to the team, save the game state
      await this.scoreService.updateTeamScore(
        lobby._id.toString(),
        senderTeamName,
        score,
      );
      game.currentTurn.isTurnActive = false;

      await game.save();
      return { correct: true, score };
    } else {
      // Deduct points for incorrect guess
      await this.scoreService.updateTeamScore(
        lobby._id.toString(),
        senderTeamName,
        -5,
      );
      await game.save();
      return { correct: false };
    }
  }
}
