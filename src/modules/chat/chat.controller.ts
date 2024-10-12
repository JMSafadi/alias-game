import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ChatService } from './services/chat.service';
import { Message } from './schemas/message.schema';
import { SendMessageDto } from './dto/send-message.dto';

/**
 * Controller responsible for handling chat-related HTTP requests.
 */
@ApiTags('Chat') // This groups the endpoints under "Chat" in Swagger
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) { }

  /**
   * Handles the HTTP GET request to retrieve the chat history.
   *
   * @returns A promise that resolves to an array of chat messages.
   * @throws HttpException - Throws an exception if retrieving the chat history fails.
   */
  @ApiOperation({ summary: 'Retrieve chat history' })
  @ApiResponse({
    status: 200,
    description: 'Chat history retrieved successfully.',
    type: [SendMessageDto],
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error. Failed to retrieve chat history.',
  })
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
