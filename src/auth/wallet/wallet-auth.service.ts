
import {
    BadRequestException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'crypto';
import { Request } from 'express';
import { ProjectLogger } from '../../logger/logger';
import { TokenService } from '../common/token.service';
import { JwtResponseWalletBasedAuth } from './models/responses/wallet-auth-jwt.response';
import { Role } from '../../models/enum/role.enum';
import { WalletAuthLoginPayload } from './models/payloads/wallet-auth-login.payload';
import { JwtResponse } from './models/responses/jwt.response';
import { recoverPersonalSignature } from '@metamask/eth-sig-util';
import DBToken from '../../models/database/token.model';
import DBUser from '../../models/database/user.model';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WalletAuthRefreshTokenPayload } from './models/payloads/wallet-auth-refresh-token.payload';

let TTLInMilliseconds = 0;

@Injectable()
export class WalletAuthService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly logger: ProjectLogger,
        private readonly tokenService: TokenService,
        @InjectRepository(DBToken) private tokenRepository: Repository<DBToken>,
        @InjectRepository(DBUser) private userRepository: Repository<DBUser>,
    ) {
        this.logger.setContext(WalletAuthService.name);
        TTLInMilliseconds =
            this.configService.get<number>('JWT_EXPIRATION_TIME_SECONDS') *
            1000;
    }
    
    async initializeAuth(
        correlationId: string,
        accountAddress: string,
    ): Promise<JwtResponseWalletBasedAuth> {
        this.logger.log(correlationId, 'initializeAuth START');
        const message = await this.generateMessage(correlationId);
        const payload = {
            sub: accountAddress,
            message: message,
            roles: Role.ANONYMOUS,
        };

        const anonymous_token = await this.jwtService.signAsync(
            payload,
            this.tokenService.getAccessTokenJwtSignedOptions(),
        );
        this.logger.log(correlationId, 'initializeAuth DONE');
        return {
            access_token: anonymous_token,
            refresh_token: null,
            message: message,
            expires_in: TTLInMilliseconds,
        };
    }

    async login(
        correlationId: string,
        authorizationHeaderValue: string,
        loginDto: WalletAuthLoginPayload,
    ): Promise<JwtResponse> {
        this.logger.log(correlationId, 'login START');
        loginDto.publicAddress = loginDto.publicAddress.toLowerCase();
        const { publicAddress, signature } = loginDto;

        this.logger.debug(
            correlationId,
            `given publicAddress: ${loginDto.publicAddress}, signature: ${loginDto.signature}`,
        );

        let user = await this.userRepository.findOne({
            where: {
                walletAddress: publicAddress
            }
        });

        if(user == null) {
            this.logger.log(correlationId, `Login with wallet user not found`);
            user = await this.userRepository.save({
                walletAddress: publicAddress,
            });
        }

        let recoveredAddr;
        const message = await this.getMessage(
            correlationId,
            authorizationHeaderValue,
            publicAddress,
        );
        
        try {
            recoveredAddr = recoverPersonalSignature({
                data: message,
                signature: signature,
            });
        } catch (err) {
            this.logger.error(correlationId, JSON.stringify(err));
            throw new BadRequestException(
                'Problem with signature verification.',
            );
        }

        this.logger.debug(
            correlationId,
            `recoveredAddr: ${recoveredAddr}, message: ${message}`,
        );

        if (recoveredAddr.toLowerCase() !== publicAddress.toLowerCase()) {
            this.logger.error(
                correlationId,
                'Signature is not correct. Public address not matched.',
            );
            throw new BadRequestException(
                'Signature is not correct. Public address not matched.',
            );
        }

        const refreshTokenPayload = {
            sub: publicAddress,
            message: message,
        };

        const refreshToken = await this.jwtService.signAsync(
            refreshTokenPayload,
            this.tokenService.getRefreshTokenJwtSignedOptions(),
        );

        const payload = {
            sub: publicAddress,
            message: message,
            roles: Role.USER,
        };

        const accessToken = await this.jwtService.signAsync(
            payload,
            this.tokenService.getAccessTokenJwtSignedOptions(),
        );

        await this.tokenRepository.save({
            refreshToken: refreshToken,
            user: user,
        });

        this.logger.log(correlationId, 'login DONE');
        return {
            access_token: accessToken,
            refresh_token: refreshToken,
        };
    }

    async refresh(
        correlationId: string,
        refreshTokenDto: WalletAuthRefreshTokenPayload,
    ): Promise<JwtResponse> {
        this.logger.log(correlationId, 'refresh START');
        const refresh_token = refreshTokenDto.refreshToken;
        const publicAddress = refreshTokenDto.publicAddress.toLowerCase();
        let tokenPublicAddress = '';
        let expirationTime = 0;
        let message = '';

        try {
            const tokenInfo = this.jwtService.decode(refresh_token);
            tokenPublicAddress = tokenInfo['sub'].toLowerCase();
            message = tokenInfo['message'];
            expirationTime = tokenInfo['exp'];
        } catch (err) {
            this.logger.error(correlationId, 'Refresh Token is not valid.');
            throw new UnauthorizedException('Refresh Token is not valid.');
        }

        const exp = new Date(expirationTime * 1000);
        this.logger.error(correlationId, exp);
        if (new Date() > exp) {
            await this.tokenService.delete(
                correlationId,
                publicAddress,
                refresh_token,
            );
            this.logger.error(correlationId, 'Refresh Token is expired.');
            throw new UnauthorizedException('Refresh Token is expired.');
        }

        if (tokenPublicAddress !== publicAddress) {
            this.logger.error(
                correlationId,
                'Token Public Address does not match with payload.',
            );
            throw new UnauthorizedException(
                'Token Public Address does not match with payload.',
            );
        }
        const token = await this.tokenService.getToken(
            refresh_token,
        );
        if (token === undefined || token === null) {
            this.logger.error(correlationId, 'Token is not available in DB.');
            throw new UnauthorizedException('Token is not available in DB.');
        }

        const refreshTokenPayload = {
            sub: publicAddress,
            message: message,
        };

        const new_refresh_token = await this.jwtService.signAsync(
            refreshTokenPayload,
            this.tokenService.getRefreshTokenJwtSignedOptions(),
        );

        const payload = {
            sub: publicAddress,
            message: message,
            roles: Role.USER,
        };

        const new_access_token = await this.jwtService.signAsync(
            payload,
            this.tokenService.getAccessTokenJwtSignedOptions(),
        );


        try {
            let user = await this.userRepository.findOne({
                where: {
                    walletAddress: publicAddress
                }
            });
    
            if(user == null) {
                this.logger.error(correlationId, `login user not found with wallet: ${publicAddress}.`);
                throw new BadRequestException('USER NOT FOUND WITH THIS Wallet');
            }

            const response = await this.tokenService.update(
                user,
                refresh_token,
                new_refresh_token
            );
            if (response) {
                return {
                    access_token: new_access_token,
                    refresh_token: new_refresh_token
                };
            }
            this.logger.log(correlationId, `Token is not available in DB.`);
            throw new UnauthorizedException('Token is not available in DB.');
        } catch (err) {
            this.logger.log(
                correlationId,
                `Error occured in time of refresh token update. ${err.message}`,
            );
            throw new UnauthorizedException(
                'Error occured in time of refresh token update.',
            );
        }
    }

    async generateMessage(correlationId: string): Promise<string> {
        this.logger.log(correlationId, 'generateMessage START');
        const msz = randomBytes(8).toString('hex');
        this.logger.log(correlationId, `generateMessage ENDED`);
        return msz;
    }

    async getMessage(
        correlationId: string,
        authorizationHeaderValue: string,
        accountAddress: string,
    ): Promise<string> {
        this.logger.log(correlationId, 'getMessage START');

        let token = authorizationHeaderValue.replace('bearer ', '');
        token = authorizationHeaderValue.replace('Bearer ', '');

        const tokenInfo = this.jwtService.decode(token);
        const message = tokenInfo['message'];

        if (message === '' || message === null || message === undefined) {
            this.logger.error(
                correlationId,
                `NOT_FOUND/EXPIRED message against account address: ${accountAddress}`,
            );
            throw new BadRequestException(
                `NOT_FOUND/EXPIRED message against account address: ${accountAddress}`,
            );
        }

        this.logger.log(
            correlationId,
            `getMessage DONE and message = ${message}`,
        );
        return message;
    }    
}
