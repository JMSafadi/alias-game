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
// Removed unused import of StartGameDto
import { GameService } from './../services/game.service';
import { TurnService } from '../services/turn.service';
import { TimerService } from '../services/timer.service';
import { MessageService } from '../services/message.service';
import { LobbyService } from 'src/lobby/lobby.service';
import { SendMessageDto } from '../dto/send-message.dto';
import { TurnStartedDto } from '../dto/turn-started.dto';
import { SimilarityService } from 'src/utils/similarity.service';
import { Game } from '../schemas/Game.schema';
// import { UseGuards } from '@nestjs/common';
// import { WsJwtAuthGuard } from 'src/auth/ws-jwt-auth.guard';

@WebSocketGateway({ namespace: '/game', cors: { origin: '*' } })
// @UseGuards(WsJwtAuthGuard)
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  public server: Server;

  constructor(
    private readonly gameService: GameService,
    private readonly lobbyService: LobbyService,
    private readonly turnService: TurnService,
    private readonly timerService: TimerService,
    private readonly messageService: MessageService,
    private readonly similarityService: SimilarityService,
  ) {}

  handleConnection(client: Socket): void {
    const user = client.data.user;

    if (user && typeof user === 'object') {
      console.log(`Client connected: ${client.id}, User: ${user.username}`);
    } else {
      console.warn(
        `Client connected: ${client.id}, but user data is missing or invalid.`,
      );
    }

    // Extract lobbyId from client query parameters
    const lobbyId = client.handshake.query.lobbyId as string;

    if (lobbyId) {
      client.join(`lobby_${lobbyId}`);
      console.log(`Client ${client.id} joined room lobby_${lobbyId}`);
    } else {
      console.warn(`Client ${client.id} did not provide a lobbyId`);
    }
  }

  handleDisconnect(client: Socket): void {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('send_message')
  async handleMessage(
    @MessageBody() messageBody: SendMessageDto,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    try {
      const sendMessageDto = messageBody;

      console.log('Received message from client:', sendMessageDto);

      // Get the player's role based on the current game state
      const role = await this.gameService.getPlayerRole(
        sendMessageDto.gameId,
        sendMessageDto.sender,
      );
      sendMessageDto.role = role;

      // Validate permissions
      if (
        !this.hasPermissionToSendMessage(
          role,
          sendMessageDto.messageType,
          await this.gameService.getGameById(sendMessageDto.gameId),
          sendMessageDto.sender,
        )
      ) {
        client.emit('error', {
          message: 'You do not have permission to send this message.',
        });
        return;
      }

      // Save and broadcast the message
      const message = await this.messageService.saveMessage(sendMessageDto);
      this.server
        .to(`lobby_${message.lobbyId}`)
        .emit('receive_message', message);
    } catch (error) {
      console.error('Error handling message:', error);
      client.emit('error', { message: 'Failed to handle message' });
    }
  }

  @SubscribeMessage('startGame')
  async handleStartGame(
    @MessageBody() data: { lobbyId: string },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    try {
      // Usunięcie znaków < i >
      const cleanLobbyId = data.lobbyId.replace(/[<>]/g, '');

      console.log(`Received lobbyId: ${data.lobbyId}`);
      console.log(`Cleaned lobbyId: ${cleanLobbyId}`);

      const lobby = await this.lobbyService.getLobbyById(cleanLobbyId);

      // const lobby = await this.lobbyService.getLobbyById(data.lobbyId);
      if (!lobby) {
        client.emit('error', { message: 'Lobby not found' });
        return;
      }

      // Initialize the game with data from the lobby
      const game = await this.gameService.startGameFromLobby(lobby);

      // Emit game started event to the lobby room
      this.server.to(`lobby_${lobby.lobbyID}`).emit('gameStarted', { game });

      // Initialize the first turn
      const updatedGame = await this.turnService.startTurn({
        gameId: game._id.toString(),
        teamName: game.teamsInfo[0].teamName,
      });

      // Emit turnStarted event
      this.server.to(`lobby_${lobby.lobbyID}`).emit(
        'turnStarted',
        new TurnStartedDto({
          message: `Turn started for team: ${updatedGame.currentTurn.teamName}. ${updatedGame.currentTurn.describer} is the describer!`,
          round: updatedGame.currentRound,
          turn: updatedGame.playingTurn,
          time: updatedGame.timePerTurn,
          wordToGuess: updatedGame.currentTurn.wordToGuess,
          teamName: updatedGame.currentTurn.teamName,
          describer: updatedGame.currentTurn.describer,
        }),
      );

      // Start turn timer
      this.startTurnTimer(updatedGame, lobby.lobbyID);
    } catch (error) {
      console.error('Error starting game:', error);
      client.emit('error', { message: 'Failed to start game' });
    }
  }

  // Updated startTurnTimer to accept lobbyId
  private startTurnTimer(game: Game, lobbyId: string): void {
    this.timerService.startTimer(
      game._id.toString(),
      game.timePerTurn,
      async () => {
        const turn = await this.turnService.endTurn(game._id.toString());
        this.server.to(`lobby_${lobbyId}`).emit('turnEnded', {
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
          this.server.to(`lobby_${lobbyId}`).emit('gameEnded', {
            message: endGameMessage,
          });
          console.log('Game Ended.');
        } else {
          // Emit turnStarted event with TurnStartedDto
          this.server.to(`lobby_${lobbyId}`).emit(
            'turnStarted',
            new TurnStartedDto({
              message: `Turn started for team: ${nextTurn.currentTurn.teamName}. ${nextTurn.currentTurn.describer} is the describer!`,
              round: nextTurn.currentRound,
              turn: nextTurn.playingTurn,
              time: nextTurn.timePerTurn,
              wordToGuess: nextTurn.currentTurn.wordToGuess,
              teamName: nextTurn.currentTurn.teamName,
              describer: nextTurn.currentTurn.describer,
            }),
          );
          this.startTurnTimer(nextTurn, lobbyId);
        }
      },
    );
  }

  // Method to check user permissions
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
