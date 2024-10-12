// src/auth/ws-jwt-auth.guard.ts

import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';

@Injectable()
export class WsJwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const client: Socket = context.switchToWs().getClient<Socket>();
    const token = client.handshake.query.token as string;

    if (!token) {
      client.emit('error', { message: 'Authentication token missing' });
      return false;
    }

    try {
      const payload = this.jwtService.verify(token);
      client.data.user = payload; // Przechowuje dane użytkownika w client.data
      return true;
    } catch (err) {
      console.error('JWT verification failed:', err); // Logowanie błędu
      client.emit('error', { message: 'Invalid authentication token' });
      return false;
    }
  }
}
