import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Request } from 'express';
import { RegisterWithEmailPayload } from './models/payloads/register-with-email.payload';
import { InjectRepository } from '@nestjs/typeorm';
import DBUser from 'src/models/database/user.model';
import { Repository } from 'typeorm';
import { RESPONSE_MESSAGES } from './constants/response-messages';
import { Role } from 'src/models/enum/role.enum';
import { LoginWithEmailPayload } from './models/payloads/login-with-email.payload';
import { TokenService } from '../common/token.service';
import DBToken from 'src/models/database/token.model';
import { JwtResponse } from './models/responses/jwt.response';


@Injectable()
export class EmailPassAuthService {
    constructor(
        private readonly tokenService: TokenService,
        @InjectRepository(DBUser) private tokenRepository: Repository<DBToken>,
        @InjectRepository(DBUser) private userRepository: Repository<DBUser>,
    ) {}
    
    async register(correlationId: string, registerPayload: RegisterWithEmailPayload, role: Role) {
        const user = await this.userRepository.findOne({
            where: { email: registerPayload.email },
        });

        if(user) {
            throw new BadRequestException(RESPONSE_MESSAGES.USER_ALREADY_ADDED);
        }

        registerPayload.password = await bcrypt.hash(registerPayload.password, 10);
        const userModel = this.getUserModel(registerPayload, role);
        const registeredUser = await this.userRepository.save(userModel);
        registeredUser.password = null;
        return registeredUser;
    }

    async login(correlationId: string, loginWithEmailPayload: LoginWithEmailPayload) {
        const user = await this.userRepository.findOne({
            where: { email: loginWithEmailPayload.email },
        });

        if(user == null) {
            throw new BadRequestException(RESPONSE_MESSAGES.USER_NOT_FOUND);
        }

        const isValidPass = bcrypt.compare(loginWithEmailPayload.password, user.password);
        if(!isValidPass) {
            throw new BadRequestException(RESPONSE_MESSAGES.PASSWORD_NOT_VALID);
        }

        const { accessToken, refreshToken } = await this.tokenService.generateToken(user);
        await this.tokenRepository.create(this.getToken(refreshToken, user));
        return new JwtResponse(accessToken, refreshToken);
    }

    async refresh(correlationId: string, existingRefreshToken: string, email: string) {
        const user = await this.userRepository.findOne({
            where: { email: email },
        });

        if(user == null) {
            throw new BadRequestException(RESPONSE_MESSAGES.USER_NOT_FOUND);
        }

        const token = await this.tokenRepository.findOne({
            where: {
                refreshToken: existingRefreshToken,
            },
            relations: ['user']
        });

        if(token == null) {
            throw new BadRequestException(RESPONSE_MESSAGES.REFRESH_TOKEN_NOT_FOUND);
        }

        if(token.user?.email != email) {
            throw new BadRequestException(RESPONSE_MESSAGES.USER_NOT_MATCHED)
        }


        const { accessToken, refreshToken } = await this.tokenService.generateToken(user);
        await this.tokenRepository.update(token.id, this.getToken(refreshToken, user));
        return new JwtResponse(accessToken, refreshToken);
    }

    private getToken(refreshToken: string, user: DBUser): DBToken {
        const token = new DBToken();
        token.refreshToken = refreshToken;
        token.user = user;
        return token;
    }

    private getUserModel(registerPayload: RegisterWithEmailPayload, role: Role): DBUser {
        const user = new DBUser();
        user.email = registerPayload.email;
        user.name = registerPayload.name;
        user.password = registerPayload.password;
        user.role = role;
        return user;
    }
}
