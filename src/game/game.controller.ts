import { Body, Controller, Get, Post } from "@nestjs/common";
import { GameService } from "./game.service";
import { StartGameDto } from "./dto/StartGame.dto";
import { Game } from "./schemas/Game.schema";
import { StartTurnDto } from "./dto/startTurn.dto";

@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}
  @Get()
  test() {
    return { message: 'Game endpoint' }
  }
  @Post('start')
  async startGame(@Body() startGameDto: StartGameDto): Promise<Game> {
    return this.gameService.startGame(startGameDto)
  }
  @Post('/turn/start')
  async startTurn(@Body() startTurn: StartTurnDto): Promise<Game> {
    return this.gameService.startTurn(startTurn)
  }
}
