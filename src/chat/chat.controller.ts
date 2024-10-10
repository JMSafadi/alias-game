import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { MessageService } from '../game/services/message.service';
import { Message } from '../game/schemas/Message.schema';

/**
 * Controller responsible for handling chat-related HTTP requests.
 */
@Controller('chat')
export class ChatController {
  constructor(private readonly messageService: MessageService) {}

  /**
   * Handles the HTTP GET request to retrieve the chat history.
   *
   * @returns A promise that resolves to an array of chat messages.
   * @throws HttpException - Throws an exception if retrieving the chat history fails.
   */
  @Get('history')
  async getChatHistory(): Promise<Message[]> {
    console.log('Handling request to get chat history');
    try {
      const chatHistory = await this.messageService.getMessages();
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
