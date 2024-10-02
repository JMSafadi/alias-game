import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from 'socket.io'
import { StartGameDto } from "../dto/start-game.dto";
import { GameService } from "../game.service";
import { StartTurnDto } from "../dto/start-turn.dto";

@WebSocketGateway({ cors: true })
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server

  handleConnection(client: any, ...args: any[]) {
    console.log(`Client connected: ${client.id}`)
  }

  handleDisconnect(client: any) {
    console.log(`Client disconnected: ${client.id}`)
  }

  constructor(private readonly gameService: GameService) {}
  // Event to init game
  @SubscribeMessage('startGame')
  async handleStartGame(@MessageBody() startGameDto: StartGameDto, @ConnectedSocket() client: Socket) {
    const game = await this.gameService.startGame(startGameDto)
    console.log(game)
    this.server.emit('gameStarted', { message: 'Game started!', game })
  }
  // Event to init turn
  @SubscribeMessage('startTurn')
  async handleStartTurn(@MessageBody() StartTurnDto: StartTurnDto, @ConnectedSocket() client: Socket) {
    const turn = await this.gameService.startTurn(StartTurnDto)
    console.log(turn)
    this.server.emit('turnStarted', { message: 'Turn started', turn } )
  }
}
