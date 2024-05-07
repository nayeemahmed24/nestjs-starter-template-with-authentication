import { Body, Controller, Get, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { randomUUID } from 'crypto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ProjectLogger } from '../../logger/logger';
import { Role } from '../../models/enum/role.enum';
import { InitializeWalletAuthPayload } from './models/payloads/init-wallet-auth.payload';
import { WalletAuthService } from './wallet-auth.service';
import { WalletAuthLoginPayload } from './models/payloads/wallet-auth-login.payload';
import { WalletAuthRefreshTokenPayload } from './models/payloads/wallet-auth-refresh-token.payload';
import { Roles } from './decorators/roles.decorator';
import { Wallet } from './decorators/wallet.decorator';
import { RolesGuard } from './guards/roles.gaurd';

@ApiTags('Auth With WalletAddress')
@Controller('wallet-auth')
@UseGuards(RolesGuard)
export class WalletAuthController {
    constructor(
        private readonly logger: ProjectLogger,
        private readonly walletAuthService: WalletAuthService,
    ) { }

    @Post('init')
    async initializeAuth(
        @Body() command: InitializeWalletAuthPayload,
        @Res() response: Response,
    ): Promise<any> {
        const correlationId: string = randomUUID();
        this.logger.log(
            correlationId,
            `initializeAuth START for walletAddress: ${command.publicAddress}`,
        );
        const res = await this.walletAuthService.initializeAuth(
            correlationId,
            command.publicAddress,
        );

        this.logger.log(correlationId, 'initialized Authentication');

        response.status(HttpStatus.OK);

        this.logger.log(
            correlationId,
            `initializeAuth DONE for walletAddress: ${command.publicAddress}`,
        );
        return response.json(res);
    }

    @Post('login')
    @ApiBearerAuth('access-token')
    @Roles(Role.ANONYMOUS)
    async login(
        @Req() request: any,
        @Body() payload: WalletAuthLoginPayload,
        @Res() response: Response,
    ): Promise<any> {
        const correlationId: string = randomUUID();
        this.logger.log(
            correlationId,
            `login START for walletAddress: ${payload.publicAddress}`,
        );

        const authorizationHeaderValue = request.headers['authorization'];
        

        const token = await this.walletAuthService.login(
            correlationId,
            authorizationHeaderValue,
            payload,
        );

        response.status(HttpStatus.OK);

        this.logger.log(
            correlationId,
            `login DONE for walletAddress: ${payload.publicAddress}`,
        );
        return response.json(token);
    }

    @Post('refresh_token')
    async refresh_token(
        @Body() payload: WalletAuthRefreshTokenPayload,
        @Res() response: Response,
    ): Promise<any> {
        const correlationId: string = randomUUID();
        this.logger.log(
            correlationId,
            `refresh START for walletAddress: ${payload.publicAddress}`,
        );
        const token = await this.walletAuthService.refresh(
            correlationId,
            payload,
        );

        response.status(HttpStatus.OK);

        this.logger.log(
            correlationId,
            `refresh DONE for walletAddress: ${payload.publicAddress}`,
        );
        return response.json(token);
    }


    @Get('test-user')
    @ApiBearerAuth('access-token')
    @Roles(Role.USER)
    async testUser(
        @Res() response: Response,
        @Wallet() wallet: string,
    ): Promise<any> {
        const correlationId: string = randomUUID();
        this.logger.log(correlationId, `testUser STARTED.`);
        const res =  {
            wallet: wallet,
            message: `Authorization is working fine for wallet`
        };
        response.status(HttpStatus.OK);
        this.logger.log(correlationId, `testUser ENDED.`);
        return response.json(res);
    }
}
