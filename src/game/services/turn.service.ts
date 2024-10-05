/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { InjectModel } from '@nestjs/mongoose';
import { Game } from '../schemas/Game.schema';
import { Model } from 'mongoose';
import { Injectable, NotFoundException } from '@nestjs/common';
import { StartTurnDto } from '../dto/start-turn.dto';
import { TeamService } from './team.service';
import { WordService } from './words.service';

@Injectable()
export class TurnService {
  constructor(@InjectModel(Game.name) 
  private gameModel: Model<Game>,
  private readonly teamService: TeamService,
  private readonly wordService: WordService
) {}
  async startTurn(startTurnDto: StartTurnDto) {
    try {
      // Find game
      const game = await this.gameModel.findById(startTurnDto.gameId);
      if (!game) {
        throw new NotFoundException('Game not found');
      }
      // Update first round
      if (game.currentRound === 0 && game.playingTurn === 0) {
        game.currentRound++;
        game.playingTurn++;
      }
      // Update curren turn state and generate word
      game.currentTurn = {
        teamName: startTurnDto.teamName,
        wordToGuess: this.wordService.generateWord(),
        isTurnActive: true,
      };
      // Save turn init time to calculate score
      game.currentTurnStartTime = Date.now();
      await game.save();
      return game;
    } catch (err) {
      throw new Error('Failed to start turn: ' + err.message);
    }
  }
  async endTurn(gameId: string) {
    try {
      const game = await this.gameModel.findById(gameId);
      if (!game) {
        throw new NotFoundException('Game not found');
      }
      game.currentTurn.isTurnActive = false;
      await game.save();
      return game;
    } catch (err) {
      throw new Error('Failed to end turn: ' + err.message);
    }
  }
  async startNextTurn(gameId: string) {
    try {
      const game = await this.gameModel.findById(gameId);
      if (!game) {
        throw new Error('Game not found');
      }
      // End  game
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
      // Set next turn
      game.currentTurn = {
        teamName: nextTeam,
        wordToGuess: this.wordService.generateWord(),
        isTurnActive: true,
      };
      console.log('Next turn: ', game);
      await game.save();
      return { gameOver: false, game };
    } catch (err) {
      throw new Error('Can not jump next turn' + err.message);
    }
  }
}
