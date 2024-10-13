import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MessageService } from '../game/services/message.service';
import { Message, MessageSchema } from '../game/schemas/Message.schema';
// import { CommonModule } from '../common/common.module';
import { ChatController } from './chat.controller';
import { SimilarityModule } from 'src/utils/similarity.module';

/**
 * ChatModule handles the chat functionality of the application, including real-time communication and message storage.
 */
@Module({
  imports: [
    /**
     * MongooseModule is used to import the Message schema to interact with the MongoDB database.
     */
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
    SimilarityModule,
    /**
     * CommonModule is imported to provide common utilities, such as authentication guards, across the chat module.
     */
    // CommonModule,
  ],
  providers: [
    /**
     * MessageService handles the core chat operations such as saving and retrieving messages.
     */
    MessageService,
  ],
  controllers: [
    /**
     * ChatController handles HTTP requests related to the chat functionality, such as fetching chat history.
     */
    ChatController,
  ],
  exports: [MessageService, MongooseModule],
})
export class ChatModule {}
