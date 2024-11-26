import { Test, TestingModule } from '@nestjs/testing';
import { ChatController } from './chat.controller';
import { MessageService } from '../game/services/message.service';
import { Message } from '../game/schemas/Message.schema';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('ChatController', () => {
  let chatController: ChatController;
  let messageService: MessageService;

  const mockMessageService = {
    getMessages: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatController],
      providers: [
        {
          provide: MessageService,
          useValue: mockMessageService,
        },
      ],
    }).compile();

    chatController = module.get<ChatController>(ChatController);
    messageService = module.get<MessageService>(MessageService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(chatController).toBeDefined();
  });

  describe('getChatHistory', () => {
    it('should return chat history successfully', async () => {
      const mockMessages = [
        {
          content: 'Hello',
          sender: 'user123',
          timestamp: new Date(),
          messageType: 'chat',
          senderTeamName: 'team1',
          role: 'member',
        },
      ] as Message[];

      mockMessageService.getMessages.mockResolvedValueOnce(mockMessages);

      const result = await chatController.getChatHistory();

      expect(result).toEqual(mockMessages);
      expect(messageService.getMessages).toHaveBeenCalledTimes(1);
    });

    it('should throw an InternalServerErrorException when getMessages fails', async () => {
      const errorMessage = 'Failed to retrieve chat history';

      mockMessageService.getMessages.mockRejectedValueOnce(
        new HttpException(errorMessage, HttpStatus.INTERNAL_SERVER_ERROR),
      );

      await expect(chatController.getChatHistory()).rejects.toThrow(
        new HttpException(errorMessage, HttpStatus.INTERNAL_SERVER_ERROR),
      );

      expect(messageService.getMessages).toHaveBeenCalledTimes(1);
    });
  });
});