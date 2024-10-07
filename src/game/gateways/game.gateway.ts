/* eslint-disable prettier/prettier */
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
import { GameService } from './../services/game.service';
import { TurnService } from '../services/turn.service';
import { GuessWordDto } from '../dto/guess-word.dto';
import { TimerService } from '../services/timer.service';

@WebSocketGateway({ namespace: '/game', cors: { origin: '*' }})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: any) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: any) {
    console.log(`Client disconnected: ${client.id}`);
  }

  constructor(
    private readonly gameService: GameService,
    private readonly turnService: TurnService,
    private readonly timerService: TimerService,
  ) {}
  // Event to init game
  @SubscribeMessage('startGame')
  async handleStartGame(
    @MessageBody() startGameDto: StartGameDto,
    @ConnectedSocket() client: Socket,
  ) {
    const game = await this.gameService.startGame(startGameDto);
    this.server.emit('gameStarted', { message: 'Game started!', game });
    // Init new game state with first turn
    const updatedGame = await this.turnService.startTurn({
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
    this.timerService.startTimer(gameId, timePerTurn, async () => {
      const turn = await this.turnService.endTurn(gameId);
      this.server.emit('turnEnded', {
        message: 'Turn ended due to timeout',
        turn,
      });

      const { gameOver, game: nextTurn } =
        await this.turnService.startNextTurn(gameId);
      if (gameOver) {
        const teamsInfo = nextTurn.teamsInfo;
        // Find max score team/s
        const maxScore = Math.max(...teamsInfo.map((team) => team.score));
        const winningTeams = teamsInfo.filter(
          (team) => team.score === maxScore,
        );
        let endGameMessage = '';

        if (winningTeams.length > 1) {
          // If there is a tie
          const tieTeamNames = winningTeams
            .map((team) => team.teamName)
            .join(', ');
          endGameMessage = `Game over! It's a tie between teams: ${tieTeamNames} with ${maxScore} score.`;
        } else {
          // If a team won
          endGameMessage = `Game over! The winner is ${winningTeams[0].teamName} with ${maxScore} score. Congratulations!`;
        }
        // Emit game ended event
        this.server.emit('gameEnded', {
          message: endGameMessage,
        });
        console.log('Game Ended.');
      } else {
        // If game continues, start next turn
        this.server.emit('turnStarted', nextTurn.currentTurn);
        this.startTurnTimer(
          gameId,
          nextTurn.currentTurn.teamName,
          nextTurn.timePerTurn,
        );
      }
    });
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
      // Emit score for team that guess word
      this.server.emit('scoreUpdated', {
        message: `Team ${teamName} scored points!`,
        teamName,
        score: result.score,
      });

      const turnEnded = await this.turnService.endTurn(gameId);
      this.server.emit('turnEnded', {
        message: 'Correct word guessed! Turn ended',
        turn: turnEnded,
      });
      // Jump next turn
      const nextTurn = await this.turnService.startNextTurn(gameId);
      this.server.emit('turnStarted', nextTurn);
      this.startTurnTimer(
        gameId,
        nextTurn.game.currentTurn.teamName,
        nextTurn.game.timePerTurn,
      );
    } else {
      // If incorrect word, send notify
      this.server.emit('guessFailed', {
        message: 'Incorrect word! Team lost 5 points. Try again.',
      });
    }
  }
}
