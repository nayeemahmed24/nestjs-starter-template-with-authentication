import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import DBUser from '../../models/database/user.model';
import { Repository } from 'typeorm';
import DBToken from '../../models/database/token.model';
import { ConfigService } from '@nestjs/config';


@Injectable()
export class TokenService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        @InjectRepository(DBUser) private tokenService: Repository<DBToken>,
    ) {}
    
    async generateToken(user: DBUser) {
        const accessTokenPayload = {
            name: user.name,
            sub: user.email,
            role: user.role,
        };

        const refreshPayload = {
            sub: user.id,
            message: randomUUID()
        }

        const accessToken = await this.jwtService.signAsync(
            accessTokenPayload,
            this.getAccessTokenJwtSignedOptions(),
        );

        const refreshToken = await this.jwtService.signAsync(
            refreshPayload,
            this.getRefreshTokenJwtSignedOptions(),
        );

        return {
            accessToken: accessToken,
            refreshToken: refreshToken
        }
    }

    getAccessTokenJwtSignedOptions(): JwtSignOptions {
        const jwtTokenSecretKey =
            this.configService.get<string>('JWT_TOKEN_SECRET');
        const jwtTokenExpire = this.configService.get<number>(
            'JWT_EXPIRATION_TIME_SECONDS',
        );

        return {
            secret: jwtTokenSecretKey,
            expiresIn: jwtTokenExpire,
        };
    }

    getRefreshTokenJwtSignedOptions(): JwtSignOptions {
        const jwtRefreshTokenSecretKey = this.configService.get<string>(
            'JWT_REFRESH_TOKEN_SECRET',
        );
        const jwtRefreshTokenExpire = this.configService.get<number>(
            'JWT_REFRESH_EXPIRATION_TIME_SECONDS',
        );

        return {
            secret: jwtRefreshTokenSecretKey,
            expiresIn: jwtRefreshTokenExpire,
        };
    }
    
}
