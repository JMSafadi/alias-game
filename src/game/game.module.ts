import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Game, GameSchema } from './schemas/Game.schema';
import { GameService } from './services/game.service';
import { GameGateway } from './gateways/game.gateway';
import { ScoreService } from './services/score.service';
import { TimerService } from './services/timer.service';
import { TeamService } from './services/team.service';
import { TurnService } from './services/turn.service';
import { WordService } from './services/words.service';
import { SimilarityService } from 'src/utils/similarity.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Game.name, schema: GameSchema }]),
  ],
  providers: [
    GameGateway,
    GameService,
    ScoreService,
    TimerService,
    TeamService,
    TurnService,
    WordService,
    SimilarityService,
  ],
})
export class GameModule {}
