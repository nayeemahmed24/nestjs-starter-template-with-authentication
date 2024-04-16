import { Body, Controller, Get, HttpStatus, Post, Res } from '@nestjs/common';
import { RegisterWithEmailPayload } from './models/payloads/register-with-email.payload';
import { Response } from 'express';
import { randomUUID } from 'crypto';
import { EmailPassAuthService } from './email-pass-auth.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Auth With Email Password')
@Controller('auth')
export class EmailPassAuthController {
  constructor(
    private readonly emailPassAuthService: EmailPassAuthService,
  ) { }

  @Post('register')
  async register(
    @Body() payload: RegisterWithEmailPayload,
    @Res() response: Response,
  ): Promise<any> {
    const correlationId: string = randomUUID();
    const res = await this.emailPassAuthService.register(
      correlationId,
      payload,
      payload.role,
    );
    response.status(HttpStatus.OK);
    return response.json(res);
  }
}
