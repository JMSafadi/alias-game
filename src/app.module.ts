import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { GameModule } from './game/game.module';
import { ChatModule } from './modules/chat/chat.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LobbyModule } from './lobby/lobby.module';

/**
 * The root module of the application.
 * This module is responsible for importing and configuring other feature modules, global settings, and core components.
 */
@Module({
  imports: [
    /**
     * Loads environment variables into the application.
     * This module is configured to be global, meaning the environment variables will be accessible throughout the entire application.
     */
    ConfigModule.forRoot({ isGlobal: true }),

    /**
     * Configures the connection to the MongoDB database.
     * The connection string is retrieved from an environment variable named `MONGO_URI`.
     */
    MongooseModule.forRoot(process.env.MONGO_URI),

    /**
     * ChatModule provides functionality for managing chat features, such as real-time messaging between users.
     */
    ChatModule,
    GameModule,
    LobbyModule,
  ],
  controllers: [
    /**
     * AppController handles incoming HTTP requests at the root level and returns appropriate responses.
     */
    AppController,
  ],
  providers: [
    /**
     * AppService provides common services, including utility methods used by AppController.
     */
    AppService,
  ],
})
export class AppModule {}
