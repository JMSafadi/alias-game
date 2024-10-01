import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Game, GameSchema } from './schemas/Game.schema';
import { GameService } from './game.service';
import { GameController } from './game.controller';

@Module({
  imports: [MongooseModule.forFeature([
    {
      name: Game.name,
      schema: GameSchema
    }
  ])],
  providers: [GameService],
  controllers: [GameController]
})

export class GameModule { }
