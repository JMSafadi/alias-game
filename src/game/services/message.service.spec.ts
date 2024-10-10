import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { MessageService } from './message.service';
import { Message, MessageDocument } from '../schemas/Message.schema';
import { Model } from 'mongoose';

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

describe('MessageService', () => {
  let service: MessageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageService,
        {
          provide: getModelToken(Message.name),
          useValue: mockMessageModel,
        },
      ],
    }).compile();

    service = module.get<MessageService>(MessageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getMessages', () => {
    it('should return an array of messages', async () => {
      const messages = [
        {
          content: 'Hello',
          sender: 'user123',
          timestamp: new Date(),
          messageType: 'chat',
          senderTeamName: 'team1',
          role: 'member',
        },
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
