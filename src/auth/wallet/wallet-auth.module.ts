import { Module } from '@nestjs/common';
import { TokenService } from '../common/token.service';
import { JwtService } from '@nestjs/jwt';
import DBUser from '../../models/database/user.model';
import DBToken from '../../models/database/token.model';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectLogger } from '../../logger/logger';
import { WalletAuthController } from './wallet-auth.controller';
import { WalletAuthService } from './wallet-auth.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DBUser,
      DBToken
    ]),
  ],
  controllers: [WalletAuthController],
  providers: [WalletAuthService, TokenService, JwtService, ProjectLogger],
})
export class WalletAuthModule { }
