import { Test, TestingModule } from '@nestjs/testing';
import { GameGateway } from './game.gateway';
import { GameService } from './../services/game.service';
import { TurnService } from './../services/turn.service';
import { TimerService } from './../services/timer.service';
import { MessageService } from './../services/message.service';
import { LobbyService } from '../../lobby/lobby.service';
import { Server, Socket } from 'socket.io';
import { SimilarityService } from '../../utils/similarity.service';
import * as jwt from 'jsonwebtoken';


jest.mock('jsonwebtoken', () => ({
    verify: jest.fn(),
  }));
  
  const mockGameService = {
    getGameById: jest.fn().mockResolvedValue({
      currentTurn: { teamName: 'Team A', isTurnActive: true },
      lobbyId: 'lobby1',
      gameOver: false,
    }),
    checkWordGuess: jest.fn(),
    getPlayerRole: jest.fn(),
    startGameFromLobby: jest.fn(),
  };
  
  
  
  const mockTurnService = {
    startTurn: jest.fn(),
    endTurn: jest.fn(),
    startNextTurn: jest.fn(),
  };
  
  const mockTimerService = {
    startTimer: jest.fn(),
  };
  
  const mockMessageService = {
    saveMessage: jest.fn(),
  };
  
  const mockLobbyService = {
    getLobbyById: jest.fn(),
  };
  
  const mockSimilarityService = {
    calculateSimilarityText: jest.fn(),
  };

  
  describe('GameGateway', () => {
    let gateway: GameGateway;
    let server: Server;
  
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          GameGateway,
          { provide: GameService, useValue: mockGameService },
          { provide: TurnService, useValue: mockTurnService },
          { provide: TimerService, useValue: mockTimerService },
          { provide: MessageService, useValue: mockMessageService },
          { provide: LobbyService, useValue: mockLobbyService },
          { provide: SimilarityService, useValue: mockSimilarityService },
        ],
      }).compile();
  
      gateway = module.get<GameGateway>(GameGateway);
      server = new Server();
      gateway.server = server;

      gateway['hasPermissionToSendMessage'] = jest.fn().mockReturnValue(true);
    });
  
    afterEach(() => {
      jest.clearAllMocks();
    });

    describe('handleConnection', () => {
        it('should disconnect client without token', async () => {
          const mockSocket = { handshake: { query: {} }, disconnect: jest.fn() } as unknown as Socket;
      
          await gateway.handleConnection(mockSocket);
      
          expect(mockSocket.disconnect).toHaveBeenCalled();
        });
      
        it('should disconnect client with invalid token', async () => {
          const mockSocket = {
            handshake: { query: { token: 'invalid_token' } },
            disconnect: jest.fn(),
          } as unknown as Socket;
      
          (jwt.verify as jest.Mock).mockImplementation((token, secret, callback) => {
            callback(new Error('invalid token'), null);
          });
      
          await gateway.handleConnection(mockSocket);
      
          expect(mockSocket.disconnect).toHaveBeenCalled();
        });
      });      
    });