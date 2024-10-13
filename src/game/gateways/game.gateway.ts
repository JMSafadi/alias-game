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
import { GameService } from './../services/game.service';
import { TurnService } from '../services/turn.service';
import { TimerService } from '../services/timer.service';
import { MessageService } from '../services/message.service';
import { LobbyService } from 'src/lobby/lobby.service';
import { SendMessageDto } from '../dto/send-message.dto';
import { TurnStartedDto } from '../dto/turn-started.dto';
import { SimilarityService } from 'src/utils/similarity.service';
import { Game } from '../schemas/Game.schema';

@WebSocketGateway({ namespace: '/game', cors: { origin: '*' } })
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
      console.log('Received message from client:', messageBody);
      const sendMessageDto = messageBody;

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
      console.log('Message saved successfully:', message);
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
      const lobbyId = data.lobbyId;

      console.log(`Received lobbyId: ${lobbyId}`);

      // Pobieramy lobby na podstawie lobbyId
      const lobby = await this.lobbyService.getLobbyById(lobbyId);

      if (!lobby) {
        client.emit('error', { message: 'Lobby not found' });
        return;
      }

      // Sprawdzenie, czy drużyny są poprawnie przypisane
      if (
        !lobby.teams ||
        !Array.isArray(lobby.teams) ||
        lobby.teams.some(
          (team) =>
            !team.teamName ||
            !Array.isArray(team.players) ||
            team.players.length === 0,
        )
      ) {
        client.emit('error', {
          message: 'Teams are not properly assigned in the lobby',
        });
        return;
      }

      // Uruchamiamy grę na podstawie danych lobby
      const game = await this.gameService.startGameFromLobby(lobby);

      // Emitujemy event o rozpoczęciu gry do wszystkich graczy w pokoju lobby
      this.server.to(`lobby_${lobby._id}`).emit('gameStarted', { game });

      // Inicjalizujemy pierwszą turę
      const updatedGame = await this.turnService.startTurn({
        gameId: game._id.toString(),
        teamName: lobby.teams[0].teamName,
      });

      // Emitujemy event o rozpoczęciu tury
      this.server.to(`lobby_${lobby._id}`).emit(
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

      // Rozpoczynamy timer tury
      this.startTurnTimer(updatedGame, lobby._id.toString());
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
          const lobby = await this.lobbyService.getLobbyById(lobbyId);
          if (!lobby) {
            console.error('Lobby not found when ending game.');
            return;
          }

          const teamsInfo = lobby.teams;
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
