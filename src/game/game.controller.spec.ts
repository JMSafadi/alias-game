import { Test, TestingModule } from "@nestjs/testing";
import { GameController } from "./game.controller";
import { GameService } from "./services/game.service";
import { StartGameDto } from "./dto/start-game.dto";

describe('Game controller', () => {
  let controller: GameController
  let service: GameService

  beforeEach(async () => {

    const module: TestingModule = await Test.createTestingModule({
      controllers: [GameController],
      providers: [
        {
          provide: GameService,
          useValue: {
            startGame: jest.fn()
          }
        }
      ]
    }).compile()

    controller = module.get<GameController>(GameController)
    service = module.get<GameService>(GameService)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()

  })

  describe('startGame', () => {
    it('should call startGame of GameService', async () => {
      const startGameDto: StartGameDto = {
        lobbyId: '123',
        teamsInfo: [
          { teamName: 'Team A', players: ['player1', 'player2'] },
          { teamName: 'Team B', players: ['player3', 'player4'] }
        ],
        rounds: 10,
        timePerTurn: 60
      }
      await controller.startGame(startGameDto)
      expect(service.startGame).toHaveBeenCalledWith(startGameDto)
    })
  })
})
