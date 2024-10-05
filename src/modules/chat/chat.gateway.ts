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
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';

@WebSocketGateway({ namespace: '/chat', cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly chatService: ChatService) {}

  /**
   * The server instance for managing WebSocket communications.
   */
  @WebSocketServer()
  private server: Server;

  /**
   * Called after the gateway has been initialized.
   */
  afterInit(): void {
    console.log('WebSocket server initialized');
  }

  /**
   * Handles a new client connection.
   * @param client - The connected client socket.
   */
  handleConnection(client: Socket): void {
    console.log(`Client connected: ${client.id}`);
  }

  /**
   * Handles client disconnection.
   * @param client - The disconnected client socket.
   */
  handleDisconnect(client: Socket): void {
    console.log(`Client disconnected: ${client.id}`);
  }

  /**
   * Handles incoming 'send_message' events from clients.
   * Saves the message to the database and broadcasts it to all connected clients.
   * @param messageBody - The data transfer object containing message details.
   * @param client - The client socket sending the message.
   */
  @SubscribeMessage('send_message')
  async handleMessage(
    @MessageBody() messageBody: string | SendMessageDto,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    let sendMessageDto: SendMessageDto;

    try {
      // Check if messageBody is already an object or a JSON string
      if (typeof messageBody === 'string') {
        sendMessageDto = JSON.parse(messageBody);
      } else {
        sendMessageDto = messageBody;
      }

      console.log('Received message from client:', sendMessageDto);

      // Add client ID as sender if it was not provided
      sendMessageDto.sender = sendMessageDto.sender ?? client.id;

      console.log('Updated sendMessageDto with sender:', sendMessageDto);

      const message = await this.chatService.saveMessage(sendMessageDto);
      this.server.emit('receive_message', message);
    } catch (error) {
      console.error('Error saving message:', error.message);
      client.emit('error', { message: 'Failed to save message' });
    }
  }
}
