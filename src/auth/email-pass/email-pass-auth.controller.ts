import { Body, Controller, Get, HttpStatus, Post, Res } from '@nestjs/common';
import { RegisterWithEmailPayload } from './models/payloads/register-with-email.payload';
import { Response } from 'express';
import { randomUUID } from 'crypto';
import { EmailPassAuthService } from './email-pass-auth.service';
import { ApiTags } from '@nestjs/swagger';
import { LoginWithEmailPayload } from './models/payloads/login-with-email.payload';
import { ProjectLogger } from 'src/logger/logger';
import { RefreshWithEmailFlowPayload } from './models/payloads/refresh-with-email-flow.payload';

@ApiTags('Auth With Email Password')
@Controller('auth')
export class EmailPassAuthController {
  constructor(
    private readonly emailPassAuthService: EmailPassAuthService,
    private readonly logger: ProjectLogger,
  ) { }

  @Post('register')
  async register(
    @Body() payload: RegisterWithEmailPayload,
    @Res() response: Response,
  ): Promise<any> {
    const correlationId: string = randomUUID();
    this.logger.log(correlationId, `register STARTED.`);
    const res = await this.emailPassAuthService.register(
      correlationId,
      payload,
      payload.role,
    );
    response.status(HttpStatus.OK);
    return response.json(res);
  }

  @Post('login')
  async login(
    @Body() payload: LoginWithEmailPayload,
    @Res() response: Response,
  ): Promise<any> {
    const correlationId: string = randomUUID();
    const res = await this.emailPassAuthService.login(
      correlationId,
      payload,
    );
    response.status(HttpStatus.OK);
    return response.json(res);
  }

  @Post('refresh')
  async refresh(
    @Body() payload: RefreshWithEmailFlowPayload,
    @Res() response: Response,
  ): Promise<any> {
    const correlationId: string = randomUUID();
    const res = await this.emailPassAuthService.refresh(
      correlationId,
      payload.refreshToken,
      'email'
    );
    response.status(HttpStatus.OK);
    return response.json(res);
  }
}
