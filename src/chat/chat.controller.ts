import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Message } from 'src/game/schemas/Message.schema';
import { SendMessageDto } from 'src/game/dto/send-message.dto';
import { MessageService } from 'src/game/services/message.service';

/**
 * Controller responsible for handling chat-related HTTP requests.
 */
@ApiTags('Chat') // This groups the endpoints under "Chat" in Swagger
@Controller('chat')
export class ChatController {
  constructor(private readonly messageService: MessageService) {}

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
