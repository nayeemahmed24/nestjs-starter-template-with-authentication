import { Module } from '@nestjs/common';
import { EmailPassAuthController } from './email-pass-auth.controller';
import { EmailPassAuthService } from './email-pass-auth.service';
import { TokenService } from '../common/token.service';
import { JwtService } from '@nestjs/jwt';
import DBUser from '../../models/database/user.model';
import DBToken from '../../models/database/token.model';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectLogger } from '../../logger/logger';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DBUser,
      DBToken
    ]),
  ],
  controllers: [EmailPassAuthController],
  providers: [EmailPassAuthService, TokenService, JwtService, ProjectLogger],
})
export class EmailPassAuthModule { }
