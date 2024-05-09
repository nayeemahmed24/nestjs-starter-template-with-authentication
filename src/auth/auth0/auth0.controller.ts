import {
    Body,
    Controller,
    Get,
    HttpStatus,
    Post,
    Req,
    Res,
    UseGuards,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Request, Response } from 'express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Auth0Service } from './auth0.service';
import { Auth0LoginPayload } from './models/payloads/auth0-login.payload';
import { ProjectLogger } from '../../logger/logger';
import { AuthGuard } from '@nestjs/passport';
import { Email } from './decorators/email.decorator';

@ApiTags('Auth0')
@Controller('auth0')
export class Auth0Controller {
    constructor(
        private readonly logger: ProjectLogger,
        private readonly auth0Service: Auth0Service
    ) {
        this.logger.setContext(Auth0Controller.name);
    }

    @Post('login')
    async login(
        @Req() request: any,
        @Body() payload: Auth0LoginPayload,
        @Res() response: Response,
    ): Promise<any> {
        const correlationId: string = randomUUID();
        this.logger.log(correlationId, `auth0 login Started.`);
        const res = await this.auth0Service.login(
            correlationId,
            payload.code,
        );
        if (res == null) {
            response.status(HttpStatus.UNAUTHORIZED);
            return response.json('Login Failed');
        }
        response.status(HttpStatus.OK);
        return response.json(res);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('test')
    @ApiBearerAuth('access-token')
    async testUser(
        @Req() request: Request,
        @Res() response: Response,
        @Email() emailAddress: string,
    ): Promise<any> {
        return response.json({
            msg: 'User Authorized',
            email: emailAddress
        });
    }

}
