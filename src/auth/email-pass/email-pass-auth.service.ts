import { BadRequestException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { RegisterWithEmailPayload } from './models/payloads/register-with-email.payload';
import { InjectRepository } from '@nestjs/typeorm';
import DBUser from '../../models/database/user.model';
import { Repository } from 'typeorm';
import { RESPONSE_MESSAGES } from './constants/response-messages';
import { Role } from '../../models/enum/role.enum';
import { LoginWithEmailPayload } from './models/payloads/login-with-email.payload';
import { TokenService } from '../common/token.service';
import DBToken from '../../models/database/token.model';
import { JwtResponse } from './models/responses/jwt.response';
import { ProjectLogger } from '../../logger/logger';


@Injectable()
export class EmailPassAuthService {
    constructor(
        private readonly tokenService: TokenService,
        private readonly logger: ProjectLogger,
        @InjectRepository(DBToken) private tokenRepository: Repository<DBToken>,
        @InjectRepository(DBUser) private userRepository: Repository<DBUser>,
    ) {}
    
    async register(correlationId: string, registerPayload: RegisterWithEmailPayload, role: Role) {
        this.logger.log(correlationId, `register STARTED with email: ${registerPayload.emailAddress}.`);
        const user = await this.userRepository.findOne({
            where: { email: registerPayload.emailAddress },
        });

        if(user) {
            this.logger.log(correlationId, `register user already exist with email: ${registerPayload.emailAddress}.`);
            throw new BadRequestException(RESPONSE_MESSAGES.USER_ALREADY_ADDED);
        }

        registerPayload.password = await bcrypt.hash(registerPayload.password, 10);
        const userModel = this.getUserModel(registerPayload, role);
        const registeredUser = await this.userRepository.save(userModel);
        registeredUser.password = null;
        this.logger.log(correlationId, `register ENDED with email: ${registerPayload.emailAddress}.`);
        return registeredUser;
    }

    async login(correlationId: string, loginWithEmailPayload: LoginWithEmailPayload) {
        this.logger.log(correlationId, `login STARTED with email: ${loginWithEmailPayload.emailAddress}.`);
        const user = await this.userRepository.findOne({
            where: { email: loginWithEmailPayload.emailAddress },
        });

        if(user == null) {
            this.logger.error(correlationId, `login user not found with email: ${loginWithEmailPayload.emailAddress}.`);
            throw new BadRequestException(RESPONSE_MESSAGES.USER_NOT_FOUND);
        }

        const isValidPass = bcrypt.compare(loginWithEmailPayload.password, user.password);
        if(!isValidPass) {
            this.logger.error(correlationId, `login password not matched with email: ${loginWithEmailPayload.emailAddress}.`);
            throw new BadRequestException(RESPONSE_MESSAGES.PASSWORD_NOT_VALID);
        }

        const { accessToken, refreshToken } = await this.tokenService.generateToken(user);
        const token = await this.tokenRepository.save(this.getToken(refreshToken, user));
        this.logger.log(correlationId, `login ENDED with email: ${loginWithEmailPayload.emailAddress}.`);
        return new JwtResponse(accessToken, refreshToken);
    }

    async refresh(correlationId: string, existingRefreshToken: string, email: string) {
        this.logger.log(correlationId, `refresh STARTED with email: ${email}.`);
        const user = await this.userRepository.findOne({
            where: { email: email },
        });

        if(user == null) {
            this.logger.error(correlationId, `refresh user not found with email: ${email}.`);
            throw new BadRequestException(RESPONSE_MESSAGES.USER_NOT_FOUND);
        }

        const token = await this.tokenRepository.findOne({
            where: {
                refreshToken: existingRefreshToken,
            },
            relations: {
                user: true,
            },
        });

        if(token == null) {
            this.logger.error(correlationId, `refresh token not found with email: ${email}.`);
            throw new BadRequestException(RESPONSE_MESSAGES.REFRESH_TOKEN_NOT_FOUND);
        }

        if(token.user?.email != email) {
            this.logger.error(correlationId, `refresh email not matched with email: ${email}.`);
            throw new BadRequestException(RESPONSE_MESSAGES.USER_NOT_MATCHED)
        }


        const { accessToken, refreshToken } = await this.tokenService.generateToken(user);
        await this.tokenRepository.update(token.id, this.getToken(refreshToken, user));
        return new JwtResponse(accessToken, refreshToken);
    }

    authTest(correlationId: string, email: string, role: Role) {
        return {
            email: email,
            message: `Authorization is working fine. Role: ${role}`
        };
    }

    private getToken(refreshToken: string, user: DBUser): DBToken {
        const token = new DBToken();
        token.refreshToken = refreshToken;
        token.user = user;
        return token;
    }

    private getUserModel(registerPayload: RegisterWithEmailPayload, role: Role): DBUser {
        const user = new DBUser();
        user.email = registerPayload.emailAddress;
        user.name = registerPayload.name;
        user.password = registerPayload.password;
        user.role = role;
        return user;
    }
}
