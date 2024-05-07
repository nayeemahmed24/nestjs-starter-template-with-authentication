/* istanbul ignore file */
import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import { ProjectLogger } from '../../../logger/logger';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly reflector: Reflector,
        private readonly logger: ProjectLogger,
    ) {
        this.logger.setContext(RolesGuard.name);
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        this.logger.log('',  'START')
        const requireRoles = this.reflector.get<string[]>(
            'roles',
            context.getHandler(),
        );

        if (!requireRoles) {
            return true;
        }

        const request: Request = context.switchToHttp().getRequest();

        const authorizationHeaderValue = request.headers['authorization'];
        if (
            authorizationHeaderValue === null ||
            authorizationHeaderValue === undefined
        ) {
            throw new UnauthorizedException('authorization header is missing');
        }

        let token = authorizationHeaderValue.replace('bearer ', '');
        token = authorizationHeaderValue.replace('Bearer ', '');

        const correlationId = uuidv4();

        const jwtTokenSecretKey =
            this.configService.get<string>('JWT_TOKEN_SECRET');

        try {
            const response = await this.jwtService.verifyAsync(token, {
                secret: jwtTokenSecretKey,
            });

            this.logger.log(
                correlationId,
                `Token validation is successful with response: ${JSON.stringify(
                    response,
                )}`,
            );
        } catch (err) {
            throw new UnauthorizedException(
                `Token is invalid with error: ${err}`,
            );
        }

        const tokenInfo = this.jwtService.decode(token);
        const userRoles = tokenInfo['roles'];

        this.logger.debug(correlationId, `user roles are: ${userRoles}`);

        return requireRoles == userRoles;
    }
}
