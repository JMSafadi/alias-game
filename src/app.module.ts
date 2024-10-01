import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GameModule } from './game/game.module';

@Module({
  imports: [MongooseModule.forRoot(process.env.MONGO_URI), GameModule],
  controllers: [],
  providers: [],
})
export class AppModule { }