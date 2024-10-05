import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message, MessageDocument } from './schemas/message.schema';
import { SendMessageDto } from './dto/send-message.dto';

/**
 * ChatService provides methods to handle chat-related operations such as saving and retrieving messages.
 */
@Injectable()
export class ChatService {
  /**
   * Creates an instance of ChatService.
   * @param messageModel The injected Mongoose model for the `Message` schema.
   */
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
  ) {}

  /**
   * Saves a new message to the database.
   * @param sendMessageDto The data transfer object containing the content of the message.
   * @returns A promise that resolves to the saved message.
   */
  async saveMessage(sendMessageDto: SendMessageDto): Promise<Message> {
    console.log('sendMessageDto:', sendMessageDto);

    // Sprawdzenie obecności wymaganych pól
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
    });

    console.log('createdMessage:', createdMessage);
    return createdMessage.save();
  }

  /**
   * Retrieves all messages from the database.
   * @returns A promise that resolves to an array of messages.
   */
  async getMessages(): Promise<Message[]> {
    return this.messageModel.find().exec();
  }
}
