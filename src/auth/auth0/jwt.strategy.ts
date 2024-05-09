/* istanbul ignore file */
import { passportJwtSecret } from 'jwks-rsa';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly configService: ConfigService) {
        super({
            secretOrKeyProvider: passportJwtSecret({
                cache: true,
                rateLimit: true,
                jwksRequestsPerMinute: 5,
                jwksUri: `https://${configService.get<string>('DOMAIN')}/.well-known/jwks.json`,
            }),

            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // 1AUD
            audience: [
                `${configService.get<string>('AUD')}`,
                `https://${configService.get<string>('DOMAIN')}/userinfo`
            ],
            issuer: `https://${configService.get<string>('DOMAIN')}/`,
        });
    }

    validate(payload: any) {
        return payload;
    }
}
