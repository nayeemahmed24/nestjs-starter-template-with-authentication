import { Body, Controller, Get, HttpStatus, Post, Res, UseGuards } from '@nestjs/common';
import { RegisterWithEmailPayload } from './models/payloads/register-with-email.payload';
import { Response } from 'express';
import { randomUUID } from 'crypto';
import { EmailPassAuthService } from './email-pass-auth.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { LoginWithEmailPayload } from './models/payloads/login-with-email.payload';
import { ProjectLogger } from '../../logger/logger';
import { RefreshWithEmailFlowPayload } from './models/payloads/refresh-with-email-flow.payload';
import { Email } from './decorators/email.decorator';
import { Role } from '../../models/enum/role.enum';
import { Roles } from './decorators/roles.decorator';
import { RolesGuard } from './guards/roles.gaurd';

@ApiTags('Auth With Email Password')
@Controller('auth')
@UseGuards(RolesGuard)
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
    this.logger.log(correlationId, `register ENDED.`);
    return response.json(res);
  }

  @Post('login')
  async login(
    @Body() payload: LoginWithEmailPayload,
    @Res() response: Response,
  ): Promise<any> {
    const correlationId: string = randomUUID();
    this.logger.log(correlationId, `login STARTED.`);
    const res = await this.emailPassAuthService.login(
      correlationId,
      payload,
    );
    response.status(HttpStatus.OK);
    this.logger.log(correlationId, `login ENDED.`);
    return response.json(res);
  }

  @Post('refresh')
  @ApiBearerAuth('access-token')
  async refresh(
    @Body() payload: RefreshWithEmailFlowPayload,
    @Res() response: Response,
    @Email() email: string,
  ): Promise<any> {
    const correlationId: string = randomUUID();
    this.logger.log(correlationId, `refresh STARTED.`);
    const res = await this.emailPassAuthService.refresh(
      correlationId,
      payload.refreshToken,
      email
    );
    response.status(HttpStatus.OK);
    this.logger.log(correlationId, `refresh ENDED.`);
    return response.json(res);
  }

  @Get('test-admin')
  @ApiBearerAuth('access-token')
  @Roles(Role.ADMIN)
  async testAdmin(
    @Res() response: Response,
    @Email() email: string,
  ): Promise<any> {
    const correlationId: string = randomUUID();
    this.logger.log(correlationId, `testAdmin STARTED.`);
    const res = this.emailPassAuthService.authTest(
      correlationId,
      email,
      Role.ADMIN
    );
    response.status(HttpStatus.OK);
    this.logger.log(correlationId, `testAdmin ENDED.`);
    return response.json(res);
  }

  @Get('test-user')
  @ApiBearerAuth('access-token')
  @Roles(Role.USER)
  async testUser(
    @Res() response: Response,
    @Email() email: string,
  ): Promise<any> {
    const correlationId: string = randomUUID();
    this.logger.log(correlationId, `testUser STARTED.`);
    const res = this.emailPassAuthService.authTest(
      correlationId,
      email,
      Role.USER
    );
    response.status(HttpStatus.OK);
    this.logger.log(correlationId, `testUser ENDED.`);
    return response.json(res);
  }
}
