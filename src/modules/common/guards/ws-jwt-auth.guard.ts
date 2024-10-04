import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class WsJwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const client = context.switchToWs().getClient();
    const token = client.handshake.query.token;

    try {
      const decoded = jwt.verify(token, 'your-secret-key');
      client.user = decoded;
      return true;
    } catch (err) {
      throw new WsException('Unauthorized');
    }
  }
}
