import { StartTurnDto } from './dto/start-turn.dto';
import { StartGameDto } from './dto/start-game.dto';
import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Game } from "./schemas/game.schema";

@Injectable()
export class GameService {
  constructor(@InjectModel(Game.name) private gameModel: Model<Game>) {}

  async startGame(startGameDto: StartGameDto) {
    try {
      // Create a new game instances using DTO
      const newGame = new this.gameModel(startGameDto)
      // Save in database
      return newGame.save()
    } catch (err) {
      throw new Error('Failted to start game: ' + err.message)
    }
  }

  async startTurn(startTurnDto: StartTurnDto) {
    try {
      // Find game
      const game = await this.gameModel.findById(startTurnDto.gameId)
      if(!game) {
        throw new NotFoundException('Game not found')
      }
      // Update turn state
      game.currentTurn = {
        teamName: startTurnDto.teamName,
        wordToGuess: 'rabbit',
        isTurnActive: true
      }
      await game.save()
      return game
    } catch (err) {
      throw new Error('Failed to start turn: ' + err.message)
    }
  }
}
