import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { ChatModule } from './modules/chat/chat.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

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
     * UsersModule provides functionality related to user management, including CRUD operations.
     */
    UsersModule,

    /**
     * ChatModule provides functionality for managing chat features, such as real-time messaging between users.
     */
    ChatModule,

    /**
     * ServeStaticModule is used to serve static files from the `public` directory.
     * In this configuration, the module serves the file `alias-game.html` as the default entry point.
     * This is useful for providing an HTML client that can be accessed directly in the browser.
     * The static files are served from the `/` root path of the application.
     */
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/',
      serveStaticOptions: {
        index: 'alias-game.html',
      },
    }),
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
