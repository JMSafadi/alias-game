import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

/**
 * WebSocket JWT Authentication Guard.
 *
 * This guard checks if the incoming WebSocket connection has a valid JWT token.
 * It extracts the token from the client's handshake query and verifies it.
 * If the token is valid, the user's information is attached to the client object.
 * Otherwise, a WebSocket exception is thrown.
 */
@Injectable()
export class WsJwtAuthGuard implements CanActivate {
  /**
   * Constructor for WsJwtAuthGuard.
   *
   * @param {ConfigService} configService - The configuration service to access environment variables.
   */
  constructor(private readonly configService: ConfigService) {}

  /**
   * Method that determines whether a request should be granted or denied.
   *
   * @param {ExecutionContext} context - The execution context which provides details about the current request.
   * @returns {boolean} - Returns `true` if the request is authorized, otherwise throws a WebSocket exception.
   * @throws {WsException} - Throws an exception if the token is invalid or not provided.
   */
  canActivate(context: ExecutionContext): boolean {
    const client = context.switchToWs().getClient();
    const token = client.handshake.query.token;

    try {
      const secret = this.configService.get<string>('JWT_SECRET');
      const decoded = jwt.verify(token, secret);
      client.user = decoded;
      return true;
    } catch {
      throw new WsException('Unauthorized');
    }
  }
}
