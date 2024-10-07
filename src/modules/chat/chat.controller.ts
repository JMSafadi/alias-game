import {
  Controller,
  Get,
  // UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ChatService } from './chat.service';
// import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Message } from './schemas/message.schema';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  /**
   * Retrieves the chat history for the current room.
   *
   * @returns A promise that resolves to an array of chat messages.
   * @throws HttpException - Throws an exception if retrieving the chat history fails.
   */
  // @UseGuards(JwtAuthGuard)
  @Get('history')
  async getChatHistory(): Promise<Message[]> {
    try {
      const chatHistory = await this.chatService.getMessages();
      return chatHistory;
    } catch {
      throw new HttpException(
        'Failed to retrieve chat history',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
