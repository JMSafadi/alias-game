import { InjectModel } from '@nestjs/mongoose';
import { Game } from '../schemas/Game.schema';
import { Model } from 'mongoose';
import { Injectable, NotFoundException } from '@nestjs/common';
import { StartTurnDto } from '../dto/start-turn.dto';
import { TeamService } from './team.service';
import { WordService } from './words.service';

interface StartNextTurnResponse {
  gameOver: boolean;
  game: Game;
}

@Injectable()
export class TurnService {
  constructor(
    @InjectModel(Game.name)
    private gameModel: Model<Game>,
    private readonly teamService: TeamService,
    private readonly wordService: WordService,
  ) {}

  async startTurn(startTurnDto: StartTurnDto): Promise<Game> {
    // Find game
    const game = await this.gameModel.findById(startTurnDto.gameId);
    if (!game) {
      throw new NotFoundException('Game not found');
    }

    // Find team playing
    const currentTeam = game.teamsInfo.find(
      (team) => team.teamName === startTurnDto.teamName,
    );
    if (!currentTeam) {
      throw new NotFoundException('Team not found');
    }

    // Assign describer role randomly
    const describer = this.assignDescriber(currentTeam.players);

    // Determine guessers - wszyscy gracze w drużynie oprócz describera
    const guessers = currentTeam.players.filter(
      (player) => player !== describer,
    );

    // Update first round
    if (game.currentRound === 0 && game.playingTurn === 0) {
      game.currentRound++;
      game.playingTurn++;
    }

    // Update current turn state and generate word
    game.currentTurn = {
      teamName: startTurnDto.teamName,
      wordToGuess: this.wordService.generateWord(),
      describer,
      guessers, // Przypisanie guessers do currentTurn
      isTurnActive: true,
    };

    // Save turn init time to calculate score
    game.currentTurnStartTime = Date.now();
    await game.save();
    return game;
  }

  async endTurn(gameId: string): Promise<Game> {
    const game = await this.gameModel.findById(gameId);
    if (!game) {
      throw new NotFoundException('Game not found');
    }
    // Updated and save new turn state
    game.currentTurn.isTurnActive = false;
    await game.save();
    return game;
  }

  async startNextTurn(gameId: string): Promise<StartNextTurnResponse> {
    const game = await this.gameModel.findById(gameId);
    if (!game) {
      throw new NotFoundException('Game not found');
    }

    // Verify and end game
    if (
      game.currentRound === game.rounds &&
      game.playingTurn === game.teamsInfo.length
    ) {
      return { gameOver: true, game };
    }

    // Restart turn time to calculate score
    game.currentTurnStartTime = Date.now();
    game.playingTurn++;

    // Updated current turn and round
    if (game.playingTurn > game.teamsInfo.length) {
      game.playingTurn = 1;
      game.currentRound++;
    }

    // Get next team to change turn
    const nextTeam = this.teamService.getNextTeam(game);

    // Find team playing
    const currentTeam = game.teamsInfo.find(
      (team) => team.teamName === nextTeam,
    );
    if (!currentTeam) {
      throw new NotFoundException('Team not found');
    }

    const describer = this.assignDescriber(currentTeam.players);

    // Determine guessers - wszyscy gracze w drużynie oprócz describera
    const guessers = currentTeam.players.filter(
      (player) => player !== describer,
    );

    // Set next turn
    game.currentTurn = {
      teamName: nextTeam,
      wordToGuess: this.wordService.generateWord(),
      describer,
      guessers, // Przypisanie guessers do currentTurn
      isTurnActive: true,
    };
    console.log('Next turn: ', game);
    await game.save();
    return { gameOver: false, game };
  }

  private assignDescriber(players: string[]): string {
    const randomIndex = Math.floor(Math.random() * players.length);
    return players[randomIndex];
  }
}
