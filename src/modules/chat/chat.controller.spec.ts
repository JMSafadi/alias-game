// src/modules/chat/chat.controller.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { Message } from './schemas/message.schema';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('ChatController', () => {
  let chatController: ChatController;
  let chatService: ChatService;

  // Mock implementation of ChatService
  const mockChatService = {
    getMessages: jest.fn(),
  };

  beforeEach(async () => {
    // Reset the mock's call history before each test
    mockChatService.getMessages.mockClear();

    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [ChatController],
      providers: [
        {
          provide: ChatService,
          useValue: mockChatService,
        },
      ],
    }).compile();

    chatController = moduleRef.get<ChatController>(ChatController);
    chatService = moduleRef.get<ChatService>(ChatService);
  });

  it('should be defined', () => {
    expect(chatController).toBeDefined();
  });

  describe('getChatHistory', () => {
    it('should return an array of messages', async () => {
      const messages: Message[] = [
        {
          content: 'Hello',
          sender: 'user123',
          timestamp: new Date(),
          // Add other required fields if any
        },
      ];

      // Mock the ChatService.getMessages() to return the messages
      mockChatService.getMessages.mockResolvedValue(messages);

      const result = await chatController.getChatHistory();

      expect(result).toEqual(messages);
      expect(chatService.getMessages).toHaveBeenCalledTimes(1);
    });

    it('should throw an HttpException if ChatService.getMessages() throws an error', async () => {
      // Mock the ChatService.getMessages() to throw an error
      mockChatService.getMessages.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(chatController.getChatHistory()).rejects.toThrow(
        new HttpException(
          'Failed to retrieve chat history',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );

      expect(chatService.getMessages).toHaveBeenCalledTimes(1);
    });
  });
});
