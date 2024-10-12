import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Game, GameSchema } from './schemas/Game.schema';
import { Message, MessageSchema } from './schemas/message.schema';
import { GameService } from './services/game.service';
import { MessageService } from 'src/game/services/message.service';
import { GameGateway } from './gateways/game.gateway';
import { LobbyModule } from 'src/lobby/lobby.module';
import { ScoreService } from './services/score.service';
import { TimerService } from './services/timer.service';
import { TeamService } from './services/team.service';
import { TurnService } from './services/turn.service';
import { WordService } from './services/words.service';
import { SimilarityService } from 'src/utils/similarity.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Game.name, schema: GameSchema },
      { name: Message.name, schema: MessageSchema },
    ]),
    LobbyModule,
    AuthModule,
  ],
  providers: [
    GameGateway,
    GameService,
    MessageService,
    ScoreService,
    TimerService,
    TeamService,
    TurnService,
    WordService,
    SimilarityService,
  ],
})
export class GameModule {}
