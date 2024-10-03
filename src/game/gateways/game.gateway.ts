/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { StartGameDto } from '../dto/start-game.dto';
import { GameService } from '../game.service';
import { GuessWordDto } from '../dto/guess-word.dto';

@WebSocketGateway({ cors: true })
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private activeTimers = new Map();

  handleConnection(client: any) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: any) {
    console.log(`Client disconnected: ${client.id}`);
  }

  constructor(private readonly gameService: GameService) {}
  // Event to init game
  @SubscribeMessage('startGame')
  async handleStartGame(
    @MessageBody() startGameDto: StartGameDto,
    @ConnectedSocket() client: Socket,
  ) {
    const game = await this.gameService.startGame(startGameDto);
    this.server.emit('gameStarted', { message: 'Game started!', game });
    // Init new game state
    const updatedGame = await this.gameService.startTurn({
      gameId: game._id.toString(),
      teamName: game.teamsInfo[0].teamName,
    });
    // Emit start turn event
    console.log('Updated game state: ', updatedGame);

    this.server.emit('turnStarted', {
      message: `Turn started for team: ${updatedGame.currentTurn.teamName}`,
      wordToGuess: updatedGame.currentTurn.wordToGuess,
    });
    // Start timeout for first turn
    this.startTurnTimer(
      updatedGame.id,
      updatedGame.currentTurn.teamName,
      updatedGame.timePerTurn,
    );
  }

  // Method to init timer
  private startTurnTimer(
    gameId: string,
    teamName: string,
    timePerTurn: number,
  ) {
    if (this.activeTimers.has(gameId)) {
      clearTimeout(this.activeTimers.get(gameId));
    }
    const timer = setTimeout(async () => {
      console.log(`Turn ended by timeout for team: ${teamName}`);

      const turn = await this.gameService.endTurn(gameId);
      this.server.emit('turnEnded', {
        message: 'Turn ended due to timeout',
        turn,
      });

      const nextTurn = await this.gameService.startNextTurn(gameId);
      this.server.emit('turnStarted', nextTurn);
      this.startTurnTimer(
        gameId,
        nextTurn.currentTurn.teamName,
        nextTurn.timePerTurn,
      );
    }, timePerTurn * 1000);
    this.activeTimers.set(gameId, timer);
  }
  @SubscribeMessage('guessWord')
  async handleGuessWord(
    @MessageBody() guessWordDto: GuessWordDto,
    @ConnectedSocket() client: Socket,
  ) {
    const { gameId, teamName, guessWord } = guessWordDto;
    // Verify guess attempt
    const result = await this.gameService.checkWordGuess(
      gameId,
      teamName,
      guessWord,
    );
    // If correct, end turn
    if (result.correct) {
      const turnEnded = await this.gameService.endTurn(gameId);
      this.server.emit('turnEnded', {
        message: 'Correct word guessed! Turn ended',
        turn: turnEnded,
      });
      // Jump next turn
      const nextTurn = await this.gameService.startNextTurn(gameId);
      this.server.emit('turnStarted', nextTurn);
      this.startTurnTimer(
        gameId,
        nextTurn.currentTurn.teamName,
        nextTurn.timePerTurn,
      );
    } else {
      // If incorrect word, send notify
      client.emit('guessFailed', { message: 'Incorrect word! Try again.' });
    }
  }
}
