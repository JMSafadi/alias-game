import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../roles/role.enum';
import { ROLES_KEY } from '../roles/roles.decorator';
import { JwtService } from '@nestjs/jwt';
import { JwtStrategy } from '../../../auth/jwt.strategy'

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private jwtService: JwtService,
        private jwtStrategy: JwtStrategy,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requiredRoles) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const authorizationHeader = request.headers['authorization'];

        if (!authorizationHeader) {
            return false;
        }

        const token = authorizationHeader.split(' ')[1];
        const payload = this.getPayloadFromToken(token);
        const user = await this.jwtStrategy.validate(payload);
        return requiredRoles.some((role) => user.roles?.includes(role));

    }

    getPayloadFromToken(token: string): string[] {
        const decoded = this.jwtService.decode(token) as any;
        return decoded || [];
    }
}
