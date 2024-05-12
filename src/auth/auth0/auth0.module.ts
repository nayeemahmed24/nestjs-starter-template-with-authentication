import { Module } from '@nestjs/common';
import { TokenService } from '../common/token.service';
import { JwtService } from '@nestjs/jwt';
import DBUser from '../../models/database/user.model';
import DBToken from '../../models/database/token.model';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectLogger } from '../../logger/logger';
import { Auth0Controller } from './auth0.controller';
import { Auth0Service } from './auth0.service';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([
      DBUser,
      DBToken
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' })
  ],
  controllers: [Auth0Controller],
  providers: [Auth0Service, TokenService, JwtService, ProjectLogger, JwtStrategy],
  exports: [JwtStrategy]
})
export class Auth0Module { }
