import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import DBUser from '../../models/database/user.model';
import { Repository } from 'typeorm';
import { TokenService } from '../common/token.service';
import DBToken from '../../models/database/token.model';
import { ProjectLogger } from '../../logger/logger';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { JwtService } from '@nestjs/jwt';
import { JwtResponse } from './models/responses/jwt.response';

@Injectable()
export class Auth0Service {
    constructor(
        private readonly logger: ProjectLogger,
        private readonly configService: ConfigService,
        private readonly tokenService: TokenService,
        private readonly jwtService: JwtService,
        @InjectRepository(DBToken) 
        private tokenRepository: Repository<DBToken>,
        @InjectRepository(DBUser) 
        private userRepository: Repository<DBUser>,
    ) { }

    async login(correlationId: string, code: string): Promise<JwtResponse> {
        this.logger.log(correlationId, `login STARTED with code: ${code}.`);

        const domain = this.configService.get<string>('DOMAIN');
        const clientId = this.configService.get<string>('CLIENT_ID');
        const clientSecret =
            this.configService.get<string>('CLIENT_SECRET');
        const audience = this.configService.get<string>('AUDIENCE');
        const loginUrl = 'https://' + domain + '/oauth/token';
        const GRANT_TYPE = this.configService.get<string>('GRANT_TYPE');
        const ALL_SCOPES = this.configService.get<string>('ALL_SCOPES');
        const REDIRECT_URI = this.configService.get<string>('REDIRECT_URI');

        const payload = {
            grant_type: GRANT_TYPE,
            client_id: clientId,
            client_secret: clientSecret,
            scope: ALL_SCOPES,
            audience: audience,
            code: code,
            redirect_uri: REDIRECT_URI,
        };

        try {
            this.logger.log(
                correlationId,
                `LoginHandler payload: ${JSON.stringify(payload)}.`,
            );

            const { data, status } = await axios.post(loginUrl, payload, {
                headers: { 'Content-Type': 'application/json' },
            });

            if (status == HttpStatus.OK) {
                this.logger.log(correlationId, `Login Successful.`);
                const email = this.getEmailAddress(
                    correlationId,
                    data.access_token,
                );

                const name = this.getName(
                    correlationId,
                    data.id_token,
                );

                let user = await this.userRepository.findOne({
                    where: {
                        email: email
                    }
                });

                if (user == null) {
                    this.logger.log(correlationId, `Login with wallet user not found`);
                    user = await this.userRepository.save({
                        email: email,
                        name: name,
                    });
                }

                await this.tokenRepository.save({
                    refreshToken: data.refresh_token,
                    user: user,
                });

                return new JwtResponse(data.access_token, data.refresh_token);
            }
        } catch (err) {
            this.logger.log('', `LoginHandler Error: ${err.message}`);
            throw err;
        }
    }

    private getEmailAddress(correlationId: string, accessToken: string): string {
        this.logger.log(correlationId, `AuthService getEmailAddress Start.`);
        try {
            const tokenInfo = this.jwtService.decode(accessToken);
            const email = tokenInfo['email'];
            this.logger.log(
                correlationId,
                `AuthService getEmailAddress completed with email: ${email}.`,
            );
            return email;
        } catch (err) {
            this.logger.error(
                correlationId,
                `AuthService getEmailAddress error occured with message: ${err.message}`,
            );
            return null;
        }
    }

    private getName(correlationId: string, idToken: string): string {
        this.logger.log(correlationId, `AuthService getName Start.`);
        try {
            const tokenInfo = this.jwtService.decode(idToken);
            const email = tokenInfo['name'];
            this.logger.log(
                correlationId,
                `AuthService getName completed with name: ${email}.`,
            );
            return email;
        } catch (err) {
            this.logger.error(
                correlationId,
                `AuthService getName error occured with name: ${err.message}`,
            );
            return null;
        }
    }
}
