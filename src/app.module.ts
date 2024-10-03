import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { LobbyModule } from './lobby/lobby.module';

@Module({
  imports: [MongooseModule.forRoot(process.env.MONGO_URI),
    UsersModule,
    LobbyModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }