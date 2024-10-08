// 3. Zmiany w ChatService
// ChatService pozostaje odpowiedzialny za zapisywanie wiadomości i operacje CRUD. Wszystkie wiadomości powinny być zarządzane w ChatService, natomiast GameGateway używa ChatService do zapisywania wiadomości.

// chat.service.ts - przykład dodania metody do zapisu wiadomości
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message, MessageDocument } from '../schemas/message.schema';
import { SendMessageDto } from '../dto/send-message.dto';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
  ) {}

  async saveMessage(sendMessageDto: SendMessageDto): Promise<Message> {
    console.log('Saving message with content:', sendMessageDto.content);
    if (!sendMessageDto.content || !sendMessageDto.sender) {
      console.error('Validation error: Content and sender are required');
      throw new Error('Content and sender are required');
    }

    const createdMessage = new this.messageModel({
      content: sendMessageDto.content,
      sender: sendMessageDto.sender,
      timestamp: sendMessageDto.timestamp ?? Date.now(),
    });

    console.log('Created message object:', createdMessage);
    return createdMessage.save();
  }

  async getMessages(): Promise<Message[]> {
    console.log('Retrieving all messages from database');
    return this.messageModel.find().exec();
  }
}
