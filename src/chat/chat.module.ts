import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatService } from './services/chat.service';
import { ChatGateway } from './chat.gateway';
import { Message, MessageSchema } from './schemas/message.schema';
// import { CommonModule } from '../common/common.module';
import { ChatController } from './chat.controller';

/**
 * ChatModule handles the chat functionality of the application, including real-time communication and message storage.
 */
@Module({
  imports: [
    /**
     * MongooseModule is used to import the Message schema to interact with the MongoDB database.
     */
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
    /**
     * CommonModule is imported to provide common utilities, such as authentication guards, across the chat module.
     */
    // CommonModule,
  ],
  providers: [
    /**
     * ChatService handles the core chat operations such as saving and retrieving messages.
     */
    ChatService,
    /**
     * ChatGateway provides real-time communication through WebSockets.
     */
    ChatGateway,
  ],
  controllers: [
    /**
     * ChatController handles HTTP requests related to the chat functionality, such as fetching chat history.
     */
    ChatController,
  ],
})
export class ChatModule {}
