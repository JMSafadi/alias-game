import { Test, TestingModule } from '@nestjs/testing';
import { ChatService } from './chat.service';
import { getModelToken } from '@nestjs/mongoose';
import { Message, MessageDocument } from './schemas/message.schema';
import { Model } from 'mongoose';
import { SendMessageDto } from './dto/send-message.dto';

class MockMessageModel {
  private data: Partial<MessageDocument>;
  public save: jest.Mock<Promise<this>, []>;

  constructor(data: Partial<MessageDocument>) {
    this.data = data;
    this.save = jest.fn().mockResolvedValue(this);
    Object.assign(this, data);
  }

  static find = jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue([] as MessageDocument[]),
  });
}

// Casting our class to type Model<MessageDocument>
const mockMessageModel = MockMessageModel as unknown as Model<MessageDocument>;

describe('ChatService', () => {
  let service: ChatService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        {
          provide: getModelToken(Message.name),
          useValue: mockMessageModel,
        },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('saveMessage', () => {
    it('should save a new message', async () => {
      const sendMessageDto: SendMessageDto = {
        content: 'Hello World',
        sender: 'user123',
        timestamp: new Date(),
      };

      const result = await service.saveMessage(sendMessageDto);

      expect(result).toEqual(expect.objectContaining(sendMessageDto));
    });

    it('should throw an error if content or sender is missing', async () => {
      const sendMessageDto: SendMessageDto = {
        content: '',
        sender: '',
      };

      await expect(service.saveMessage(sendMessageDto)).rejects.toThrow(
        'Content and sender are required',
      );
    });
  });

  describe('getMessages', () => {
    it('should return an array of messages', async () => {
      const messages = [
        { content: 'Hello', sender: 'user123', timestamp: new Date() },
      ] as MessageDocument[];

      // Mock the exec method
      const execMock = jest.fn().mockResolvedValueOnce(messages);
      (MockMessageModel.find as jest.Mock).mockReturnValueOnce({
        exec: execMock,
      });

      const result = await service.getMessages();

      expect(result).toEqual(messages);
    });
  });
});
