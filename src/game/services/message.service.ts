// chat.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message, MessageDocument } from '../schemas/Message.schema';
import { SendMessageDto } from '../dto/send-message.dto';
import { SimilarityService } from 'src/utils/similarity.service';

@Injectable()
export class MessageService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    private readonly similarityService: SimilarityService, // Dodanie SimilarityService do weryfikacji wiadomości
  ) {}

  async saveMessage(sendMessageDto: SendMessageDto): Promise<Message> {
    if (!sendMessageDto.content || !sendMessageDto.sender) {
      console.error(
        'Content or sender is missing in the received message DTO:',
        sendMessageDto,
      );
      throw new Error('Content and sender are required');
    }
    const createdMessage = new this.messageModel({
      content: sendMessageDto.content,
      sender: sendMessageDto.sender,
      timestamp: sendMessageDto.timestamp ?? Date.now(),
      messageType: sendMessageDto.messageType,
      senderTeamName: sendMessageDto.senderTeamName,
      gameId: sendMessageDto.gameId,
      lobbyId: sendMessageDto.lobbyId,
      role: sendMessageDto.role,
    });

    return createdMessage.save();
  }

  async getMessages(): Promise<Message[]> {
    return this.messageModel.find().exec();
  }

  // Nowa metoda do weryfikacji wiadomości od describera
  verifyMessage(content: string, forbiddenWords: string[]): boolean {
    for (const forbiddenWord of forbiddenWords) {
      if (this.similarityService.checkGuess(content, forbiddenWord)) {
        return true;
      }
    }
    return false;
  }
}
