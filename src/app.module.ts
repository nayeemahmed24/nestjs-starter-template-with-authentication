import { MiddlewareConsumer, Module } from '@nestjs/common';
import { EmailPassAuthModule } from './auth/email-pass/email-pass-auth.module';
import DBUser from './models/database/user.model';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import Joi from 'joi';
import DBToken from './models/database/token.model';
import { LoggerModule } from './logger/logger.module';
import { CollectEmailMiddleware } from './auth/email-pass/middlewares/collect-email.middleware';
import { JwtModule } from '@nestjs/jwt';

const ENV = process.env.NODE_ENV;

@Module({
  imports: [
    LoggerModule,
    JwtModule,
    EmailPassAuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `${process.cwd()}/env/${ENV}.env`,
      load: [],

    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DATABASE_HOST'),
        port: configService.get('DATABASE_PORT'),
        username: configService.get('DATABASE_USER'),
        password: configService.get('DATABASE_PASSWORD'),
        database: configService.get('DATABASE_NAME'),
        entities: [
          DBUser,
          DBToken
        ],
        synchronize: true, // never make it true in Production, otherwise you might lose data
        logging: true,
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule { 
  configure(consumer: MiddlewareConsumer): any {
    consumer.apply(CollectEmailMiddleware).forRoutes('*');
  }
}
