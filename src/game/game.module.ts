import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Game, GameSchema } from './schemas/Game.schema';
import { GameService } from './services/game.service';
import { ChatModule } from 'src/chat/chat.module';
import { ChatService } from 'src/chat/services/chat.service';
import { GameGateway } from './gateways/game.gateway';
import { ScoreService } from './services/score.service';
import { TimerService } from './services/timer.service';
import { TeamService } from './services/team.service';
import { TurnService } from './services/turn.service';
import { WordService } from './services/words.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Game.name, schema: GameSchema }]),
    ChatModule,
  ],
  providers: [
    GameGateway,
    GameService,
    ChatService,
    ScoreService,
    TimerService,
    TeamService,
    TurnService,
    WordService,
  ],
})
export class GameModule {}
