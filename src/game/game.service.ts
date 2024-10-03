/* eslint-disable @typescript-eslint/no-explicit-any */
import { StartTurnDto } from './dto/start-turn.dto';
import { StartGameDto } from './dto/start-game.dto';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Game } from './schemas/Game.schema';
// import words from './words/words.json'

// Import didn't work. esModuleInterop?
// eslint-disable-next-line @typescript-eslint/no-require-imports
const words = require('./words/words.json');

@Injectable()
export class GameService {
  constructor(@InjectModel(Game.name) private gameModel: Model<Game>) {}

  async startGame(startGameDto: StartGameDto) {
    try {
      // Create a new game instances using DTO
      const newGame = new this.gameModel(startGameDto);
      // Save in database
      return newGame.save();
    } catch (err) {
      throw new Error('Failted to start game: ' + err.message);
    }
  }
  async startTurn(startTurnDto: StartTurnDto) {
    try {
      // Find game
      const game = await this.gameModel.findById(startTurnDto.gameId);

      if (!game) {
        throw new NotFoundException('Game not found');
      }
      // Update turn state
      game.currentTurn = {
        teamName: startTurnDto.teamName,
        wordToGuess: this.generateWord(),
        isTurnActive: true,
      };
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
      if (game.currentRound > game.rounds) {
        throw new Error('Game over: All rounds completed');
      }
      // Get next team to change turn
      const nextTeam = this.getNextTeam(game);
      // Set next turn
      game.currentTurn = {
        teamName: nextTeam,
        wordToGuess: this.generateWord(),
        isTurnActive: true,
      };
      // Next round
      game.currentRound += 1;
      console.log('Next turn: ', game);
      await game.save();
      return game;
    } catch (err) {
      throw new Error('Can not jump next turn' + err.message);
    }
  }
  private generateWord() {
    // Select random category
    const allCategories = Object.keys(words);
    const randomCategory =
      allCategories[Math.floor(Math.random() * allCategories.length)];
    if (!words[randomCategory]) {
      throw new NotFoundException(`Category ${randomCategory} not found`);
    }
    // Select random word from category
    const wordList = words[randomCategory];
    const randomWord = wordList[Math.floor(Math.random() * wordList.length)];
    return randomWord;
  }
  private getNextTeam(game: any) {
    const teams = game.teamsInfo.map((team) => team.teamName);
    const currentIndex = teams.indexOf(game.currentTurn.teamName);
    return teams[(currentIndex + 1) % teams.length];
  }
  async checkWordGuess(gameId: string, teamName: string, guessWord: string) {
    try {
      const game = await this.gameModel.findById(gameId);
      if (!game) {
        throw new NotFoundException('Game not found');
      }
      // Verify if correct team turn
      if (game.currentTurn.teamName !== teamName) {
        throw new ForbiddenException('Not your team turn!');
      }
      // Verify is guess word is correct
      console.log(game.currentTurn.wordToGuess.toLowerCase());
      const isCorrect =
        game.currentTurn.wordToGuess.toLowerCase() === guessWord.toLowerCase();
      console.log(`Word ${guessWord} is ${isCorrect}`);
      if (isCorrect) {
        // Add point to team
        const teamIndex = game.teamsInfo.findIndex(
          (team) => team.teamName === teamName,
        );
        if (teamIndex !== -1) {
          game.teamsInfo[teamIndex].score += 1;
        }
        await game.save();
      }
      return { correct: isCorrect };
    } catch (err) {
      throw new Error('Failed to check word guess: ' + err.message);
    }
  }
}
