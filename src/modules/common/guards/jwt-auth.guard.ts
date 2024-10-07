import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * JWT Authentication Guard.
 *
 * This guard extends the default `AuthGuard` from `@nestjs/passport` to use the 'jwt' strategy.
 * It automatically handles validating the JWT token and authorizing access based on the token.
 * This guard can be applied to routes or controllers to ensure that only authenticated users
 * with valid JWT tokens can access them.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
