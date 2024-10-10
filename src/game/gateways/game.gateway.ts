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
import { TimerService } from '../services/timer.service';
import { MessageService } from '../services/message.service';
import { SendMessageDto } from '../dto/send-message.dto';
import { SimilarityService } from 'src/utils/similarity.service';
import { Game } from '../schemas/Game.schema';

@WebSocketGateway({ namespace: '/game', cors: { origin: '*' } })
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  public server: Server;

  constructor(
    private readonly gameService: GameService,
    private readonly turnService: TurnService,
    private readonly timerService: TimerService,
    private readonly messageService: MessageService,
    private readonly similarityService: SimilarityService,
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
    let sendMessageDto: SendMessageDto;

    try {
      if (typeof messageBody === 'string') {
        sendMessageDto = JSON.parse(messageBody);
        if (sendMessageDto.timestamp) {
          sendMessageDto.timestamp = new Date(sendMessageDto.timestamp);
        }
      } else {
        sendMessageDto = messageBody;
      }

      console.log('Received message from client:', sendMessageDto);

      // Pobierz rolę gracza na podstawie aktualnego stanu gry
      const role = await this.gameService.getPlayerRole(
        sendMessageDto.gameId,
        sendMessageDto.sender,
      );
      sendMessageDto.role = role;

      switch (sendMessageDto.messageType) {
        case 'describe':
          if (sendMessageDto.role !== 'describer') {
            client.emit('error', { message: 'Only describers can describe!' });
            return;
          }
          break;

        case 'guess':
          if (sendMessageDto.role !== 'guesser') {
            client.emit('error', { message: 'Only guessers can guess!' });
            return;
          }
          break;

        case 'chat':
        default:
          break;
      }

      // Save and broadcast the message
      const message = await this.messageService.saveMessage(sendMessageDto);
      this.server.emit('receive_message', message);
    } catch (error) {
      console.error('Error handling message:', error);
      client.emit('error', { message: 'Failed to handle message' });
    }
  }

  // Event to init game
  @SubscribeMessage('startGame')
  async handleStartGame(
    @MessageBody() startGameDto: StartGameDto,
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
      teamName: updatedGame.currentTurn.teamName, // Dodanie teamName
      describer: updatedGame.currentTurn.describer, // Dodanie describer
    });
    // Start timeout for first turn
    this.startTurnTimer(updatedGame);
  }

  // Method to init timer
  private startTurnTimer(game: Game): void {
    this.timerService.startTimer(
      game._id.toString(),
      game.timePerTurn,
      async () => {
        const turn = await this.turnService.endTurn(game._id.toString());
        this.server.emit('turnEnded', {
          message: `Turn ended due to timeout for ${turn.currentTurn.teamName}. The word was: ${turn.currentTurn.wordToGuess}`,
        });

        const { gameOver, game: nextTurn } =
          await this.turnService.startNextTurn(game._id.toString());
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
          this.server.emit('turnStarted', {
            message: `Turn started for team: ${nextTurn.currentTurn.teamName}. ${nextTurn.currentTurn.describer} is the describer!`,
            round: nextTurn.currentRound,
            turn: nextTurn.playingTurn,
            time: nextTurn.timePerTurn,
            wordToGuess: nextTurn.currentTurn.wordToGuess,
          });
          this.startTurnTimer(nextTurn);
        }
      },
    );
  }

  // New method to check user permissions
  private hasPermissionToSendMessage(
    role: string,
    messageType: string,
    game: Game,
    sender: string,
  ): boolean {
    if (messageType === 'describe' && role !== 'describer') {
      return false;
    }
    if (
      messageType === 'guess' &&
      (role !== 'guesser' || game.currentTurn.describer === sender)
    ) {
      return false;
    }
    return true;
  }
}
