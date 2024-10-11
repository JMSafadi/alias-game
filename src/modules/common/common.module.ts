import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { WsJwtAuthGuard } from './guards/ws-jwt-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Module({
  imports: [ConfigModule],
  providers: [JwtStrategy, JwtAuthGuard, WsJwtAuthGuard],
  exports: [JwtAuthGuard, WsJwtAuthGuard],
})
export class CommonModule {}
