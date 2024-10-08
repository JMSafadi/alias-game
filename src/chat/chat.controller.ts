// 4. Zmiany w ChatController
// ChatController obsługuje HTTP GET do pobierania historii wiadomości
import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { ChatService } from './services/chat.service';
import { Message } from './schemas/message.schema';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('history')
  async getChatHistory(): Promise<Message[]> {
    console.log('Handling request to get chat history');
    try {
      const chatHistory = await this.chatService.getMessages();
      console.log('Chat history retrieved successfully');
      return chatHistory;
    } catch (error) {
      console.error('Failed to retrieve chat history:', error);
      throw new HttpException(
        'Failed to retrieve chat history',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
