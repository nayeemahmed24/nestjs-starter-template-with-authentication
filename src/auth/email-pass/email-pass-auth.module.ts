import { Module } from '@nestjs/common';
import { EmailPassAuthController } from './email-pass-auth.controller';
import { EmailPassAuthService } from './email-pass-auth.service';
import { TokenService } from '../common/token.service';
import { JwtService } from '@nestjs/jwt';
import DBUser from 'src/models/database/user.model';
import DBToken from 'src/models/database/token.model';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DBUser,
      DBToken
    ]),
  ],
  controllers: [EmailPassAuthController],
  providers: [EmailPassAuthService, TokenService, JwtService],
})
export class EmailPassAuthModule { }
