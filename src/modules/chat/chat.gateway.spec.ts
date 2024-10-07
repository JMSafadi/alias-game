// src/modules/chat/chat.gateway.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { Server, Socket } from 'socket.io';
import { SendMessageDto } from './dto/send-message.dto';
import { Message } from './schemas/message.schema';

describe('ChatGateway', () => {
  let chatGateway: ChatGateway;
  let chatService: ChatService;
  let mockServer: Partial<Server>;

  // Mock implementation of ChatService
  const mockChatService = {
    saveMessage: jest.fn(),
    getMessages: jest.fn(),
  };

  beforeEach(async () => {
    // Initialize mockServer with only the emit method mocked
    mockServer = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatGateway,
        {
          provide: ChatService,
          useValue: mockChatService,
        },
      ],
    }).compile();

    chatGateway = module.get<ChatGateway>(ChatGateway);
    chatService = module.get<ChatService>(ChatService);

    // Assign the mockServer to the ChatGateway's server property
    chatGateway.server = mockServer as Server;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(chatGateway).toBeDefined();
  });

  describe('handleConnection', () => {
    it('should log client connection', () => {
      const client: Partial<Socket> = { id: 'test-client-id' };
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      chatGateway.handleConnection(client as Socket);

      expect(consoleSpy).toHaveBeenCalledWith(`Client connected: ${client.id}`);
      consoleSpy.mockRestore();
    });
  });

  describe('handleDisconnect', () => {
    it('should log client disconnection', () => {
      const client: Partial<Socket> = { id: 'test-client-id' };
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      chatGateway.handleDisconnect(client as Socket);

      expect(consoleSpy).toHaveBeenCalledWith(
        `Client disconnected: ${client.id}`,
      );
      consoleSpy.mockRestore();
    });
  });

  describe('handleMessage', () => {
    let client: Partial<Socket>;

    beforeEach(() => {
      client = {
        id: 'test-client-id',
        emit: jest.fn(),
      };
    });

    it('should handle and broadcast a valid message object', async () => {
      const sendMessageDto: SendMessageDto = {
        content: 'Hello World',
        sender: 'user123',
        timestamp: new Date(),
      };

      const savedMessage: Message = {
        ...sendMessageDto,
        _id: 'message-id-123',
      } as Message;

      mockChatService.saveMessage.mockResolvedValue(savedMessage);

      await chatGateway.handleMessage(sendMessageDto, client as Socket);

      expect(chatService.saveMessage).toHaveBeenCalledWith(sendMessageDto);
      expect(mockServer.emit).toHaveBeenCalledWith(
        'receive_message',
        savedMessage,
      );
      expect(client.emit).not.toHaveBeenCalled();
    });

    it('should handle and broadcast a valid message JSON string', async () => {
      const sendMessageDto: SendMessageDto = {
        content: 'Hello World',
        sender: 'user123',
        timestamp: new Date(),
      };

      const messageJson = JSON.stringify(sendMessageDto);

      const savedMessage: Message = {
        ...sendMessageDto,
        _id: 'message-id-123',
        timestamp: sendMessageDto.timestamp.toISOString(), // Convert Date to string
      } as unknown as Message; // Cast to Message to bypass TypeScript error

      mockChatService.saveMessage.mockResolvedValue(savedMessage);

      await chatGateway.handleMessage(messageJson, client as Socket);

      expect(chatService.saveMessage).toHaveBeenCalledWith(sendMessageDto);
      expect(mockServer.emit).toHaveBeenCalledWith(
        'receive_message',
        expect.objectContaining({
          content: 'Hello World',
          sender: 'user123',
          timestamp: expect.any(String), // Allow any string for timestamp
          _id: 'message-id-123',
        }),
      );
      expect(client.emit).not.toHaveBeenCalled();
    });

    it('should assign client ID as sender if not provided', async () => {
      const sendMessageDto: Partial<SendMessageDto> = {
        content: 'Hello World',
        // sender is missing
        timestamp: new Date(),
      };

      const expectedDto: SendMessageDto = {
        ...sendMessageDto,
        sender: client.id,
      } as SendMessageDto;

      const savedMessage: Message = {
        ...expectedDto,
        _id: 'message-id-123',
      } as Message;

      mockChatService.saveMessage.mockResolvedValue(savedMessage);

      await chatGateway.handleMessage(
        sendMessageDto as SendMessageDto,
        client as Socket,
      );

      expect(chatService.saveMessage).toHaveBeenCalledWith(expectedDto);
      expect(mockServer.emit).toHaveBeenCalledWith(
        'receive_message',
        savedMessage,
      );
      expect(client.emit).not.toHaveBeenCalled();
    });

    it('should emit an error to client if message parsing fails', async () => {
      const invalidMessageBody = 'invalid-json';

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await chatGateway.handleMessage(invalidMessageBody, client as Socket);

      expect(chatService.saveMessage).not.toHaveBeenCalled();
      expect(mockServer.emit).not.toHaveBeenCalled();
      expect(client.emit).toHaveBeenCalledWith('error', {
        message: 'Failed to save message',
      });

      // Use stringContaining to allow partial match
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error saving message:',
        expect.stringContaining('Unexpected token'),
      );

      consoleSpy.mockRestore();
    });

    it('should emit an error to client if saving message fails', async () => {
      const sendMessageDto: SendMessageDto = {
        content: 'Hello World',
        sender: 'user123',
        timestamp: new Date(),
      };

      mockChatService.saveMessage.mockRejectedValue(
        new Error('Database error'),
      );

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await chatGateway.handleMessage(sendMessageDto, client as Socket);

      expect(chatService.saveMessage).toHaveBeenCalledWith(sendMessageDto);
      expect(mockServer.emit).not.toHaveBeenCalled();
      expect(client.emit).toHaveBeenCalledWith('error', {
        message: 'Failed to save message',
      });
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error saving message:',
        'Database error',
      );

      consoleSpy.mockRestore();
    });
  });

  describe('afterInit', () => {
    it('should log that the WebSocket server has been initialized', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      chatGateway.afterInit();

      expect(consoleSpy).toHaveBeenCalledWith('WebSocket server initialized');
      consoleSpy.mockRestore();
    });
  });
});
