import { StartTurnDto } from './dto/startTurn.dto';
import { StartGameDto } from './dto/StartGame.dto';
import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Game } from "./schemas/Game.schema";

@Injectable()
export class GameService {
  constructor(@InjectModel(Game.name) private readonly gameModel: Model<Game>) {}

  async startGame(startGameDto: StartGameDto) {
    // Create a new game instances using DTO
    const newGame = new this.gameModel({
      lobbyId: startGameDto.lobbyId,
      teamsInfo: startGameDto.teamsInfo,
      rounds: startGameDto.rounds,
      timePerTurn: startGameDto.timePerTurn,
    })
    // Save in database
    return await newGame.save()
  }

  async startTurn(startTurnDto: StartTurnDto): Promise<Game> {
    const { gameId, teamName } = startTurnDto

    // Find and check that game exists
    const game = await this.gameModel.findById(gameId)
    if (!game) {
      throw new NotFoundException(`Game with ID ${gameId} not found.`)
    }

    // Check that team exists
    const team = game.teamsInfo.find(t => t.teamName === teamName)
    if (!team) {
      throw new NotFoundException(`Team: ${teamName} not found in the game.`)
    }

    // Select a random word to guess
    const wordToGuess = this.getRandomWord()
    
    // Update turn state
    game.currentTurn = {
      teamName,
      wordToGuess,
      isTurnActive: true
    }
    // Save update game
    await game.save()
    
    return game
  }
  
  // Will come from a DB collection later?
  private getRandomWord(): string {
    const words = ['elephant', 'rabbit', 'banana']
    const randomIndex = Math.floor(Math.random() * words.length)
    return words[randomIndex]
  }
}
