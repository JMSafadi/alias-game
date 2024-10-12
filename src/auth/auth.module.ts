import { Module } from '@nestjs/common';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { JwtService } from '@nestjs/jwt';
import { WsJwtAuthGuard } from './ws-jwt-auth.guard';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { UserSchema } from '../schemas/User.schema';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    ConfigModule,
    // JwtModule.registerAsync({
    //   imports: [ConfigModule], // Importa ConfigModule aquí también
    //   inject: [ConfigService],
    //   useFactory: (config: ConfigService) => {
    //     const jwtSecret = config.get<string>('JWT_SECRET');
    //     console.log('JWT_SECRET in JwtModule:', jwtSecret);
    //     return {
    //       secret: config.get<string>('JWT_SECRET'),
    //       signOptions: {
    //         expiresIn: config.get<string | number>('JWT_EXPIRES'),
    //       },
    //     };
    //   },
    // }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' }, // lub inny czas wygaśnięcia, który preferujesz
    }),

    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, WsJwtAuthGuard, JwtService],
  exports: [JwtStrategy, PassportModule, WsJwtAuthGuard, JwtService, JwtModule],
})
export class AuthModule {}
