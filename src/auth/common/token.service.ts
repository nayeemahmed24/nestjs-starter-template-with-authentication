import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import DBUser from '../../models/database/user.model';
import { Repository, UpdateResult } from 'typeorm';
import DBToken from '../../models/database/token.model';
import { ConfigService } from '@nestjs/config';
import { DeleteResult } from 'typeorm/driver/mongodb/typings';
import { ProjectLogger } from '../../logger/logger';


@Injectable()
export class TokenService {
    constructor(
        private readonly logger: ProjectLogger,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        @InjectRepository(DBToken) private tokenRepository: Repository<DBToken>,
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

    public async update(
        user: DBUser,
        oldRefreshToken: string,
        refreshToken: string
    ): Promise<UpdateResult> {
        const existingToken: DBToken = await this.tokenRepository.findOne({
            where: {
                user: user,
                refreshToken: oldRefreshToken,
            },
        });
        if (existingToken) {
            const now: Date = new Date();
            existingToken.refreshToken = refreshToken;
            existingToken.lastUpdateDate = now.toUTCString();
            return await this.tokenRepository.update(
                existingToken.id,
                existingToken,
            );
        }
        return null;
    }

    public async delete(
        correlationId: string,
        walletAddress: string,
        refreshToken: string,
    ) {
        const token = await this.getToken(refreshToken);
        if (token === null || token === undefined) {
            this.logger.error(
                correlationId,
                'Refresh Token is not found in DB.',
            );
            throw new BadRequestException('Refresh Token is not found in DB.');
        }
        await this.tokenRepository.delete(token.id);
    }

    async getToken(
        refreshToken: string,
    ): Promise<DBToken> {
        return await this.tokenRepository.findOne({
            where: { refreshToken: refreshToken },
        });
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
