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
import { ChatService } from '../../chat/services/chat.service';
import { SendMessageDto } from '../../chat/dto/send-message.dto';

@WebSocketGateway({ namespace: '/game', cors: { origin: '*' } })
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  public server: Server;

  constructor(
    private readonly gameService: GameService,
    private readonly turnService: TurnService,
    private readonly timerService: TimerService,
    private readonly chatService: ChatService,
  ) {}

  handleConnection(client: Socket): void {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket): void {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('send_message')
  async handleMessage(
    @MessageBody() messageBody: string | SendMessageDto,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    console.log('Handling send_message event');
    let sendMessageDto: SendMessageDto;

    try {
      if (typeof messageBody === 'string') {
        console.log('Parsing messageBody as JSON');
        sendMessageDto = JSON.parse(messageBody);
        if (sendMessageDto.timestamp) {
          sendMessageDto.timestamp = new Date(sendMessageDto.timestamp);
        }
      } else {
        sendMessageDto = messageBody;
      }

      console.log('Received message from client:', sendMessageDto);
      sendMessageDto.sender = sendMessageDto.sender ?? client.id;

      console.log('Saving message to database');
      const message = await this.chatService.saveMessage(sendMessageDto);
      console.log('Message saved successfully:', message);
      this.server.emit('receive_message', message);
    } catch (error) {
      console.error(
        'Error saving message:',
        error instanceof Error ? error.message : error,
      );
      client.emit('error', { message: 'Failed to save message' });
    }
  }

  @SubscribeMessage('startGame')
  async handleStartGame(
    @MessageBody() startGameDto: StartGameDto,
    @ConnectedSocket() _client: Socket,
  ): Promise<void> {
    @ConnectedSocket() _client: Socket,
  ): Promise<void> {
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
      message: `Turn started for team: ${updatedGame.currentTurn.teamName}. ${updatedGame.currentTurn.describer} is the describer!`,
      round: updatedGame.currentRound,
      turn: updatedGame.playingTurn,
      time: updatedGame.timePerTurn,
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
    _teamName: string,
    timePerTurn: number,
  ): void {
  ): void {
    this.timerService.startTimer(gameId, timePerTurn, async () => {
      const turn = await this.turnService.endTurn(gameId);
      this.server.emit('turnEnded', {
      this.server.emit('turnEnded', {
        message: `Turn ended duo to  timeout for ${turn.currentTurn.teamName}. The word was: ${turn.currentTurn.wordToGuess}`,
        // turn
      });

      const { gameOver, game: nextTurn } =
        await this.turnService.startNextTurn(gameId);
      const { gameOver, game: nextTurn } =
        await this.turnService.startNextTurn(gameId);
      if (gameOver) {
        const teamsInfo = nextTurn.teamsInfo;
        // Find max score team/s
        const maxScore = Math.max(...teamsInfo.map((team) => team.score));
        const winningTeams = teamsInfo.filter(
          (team) => team.score === maxScore,
        );
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
        this.server.emit('turnStarted', {
          message: `Turn started for team: ${nextTurn.currentTurn.teamName}. ${nextTurn.currentTurn.describer} is the describer!`,
          round: nextTurn.currentRound,
          turn: nextTurn.playingTurn,
          time: nextTurn.timePerTurn,
          wordToGuess: nextTurn.currentTurn.wordToGuess,
        });
        this.startTurnTimer(
          gameId,
          nextTurn.currentTurn.teamName,
          nextTurn.timePerTurn,
        );
        });
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
    @ConnectedSocket() _client: Socket,
  ): Promise<void> {
    @ConnectedSocket() _client: Socket,
  ): Promise<void> {
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
        message: `Correct word guessed! Turn ended for team ${turnEnded.currentTurn.teamName}`,
      });
      // Jump next turn
      const nextTurn = await this.turnService.startNextTurn(gameId);
      this.server.emit('turnStarted', {
        message: `Turn started for team: ${nextTurn.game.currentTurn.teamName}. ${nextTurn.game.currentTurn.describer} is the describer!`,
        round: nextTurn.game.currentRound,
        turn: nextTurn.game.playingTurn,
        time: nextTurn.game.timePerTurn,
        wordToGuess: nextTurn.game.currentTurn.wordToGuess,
        message: `Turn started for team: ${nextTurn.game.currentTurn.teamName}. ${nextTurn.game.currentTurn.describer} is the describer!`,
        round: nextTurn.game.currentRound,
        turn: nextTurn.game.playingTurn,
        time: nextTurn.game.timePerTurn,
        wordToGuess: nextTurn.game.currentTurn.wordToGuess,
      });
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
      this.server.emit('guessFailed', {
        message: 'Incorrect word! Team lost 5 points. Try again.',
      });
    }
  }
}
