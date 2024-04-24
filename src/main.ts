import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import * as basicAuth from 'express-basic-auth';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  app.useGlobalPipes(new ValidationPipe());
  app.use(
    ['/swagger', '/swagger-json'],
    basicAuth({
      challenge: true,
      users: {
        [configService.get<string>('SWAGGER_USER')]:
          configService.get<string>('SWAGGER_PASSWORD'),
      },
    }),
  );
  const config = new DocumentBuilder()
    .setTitle('Nest Starter With Auth')
    .setDescription('Nest Starter With Auth API Documentation')
    .setVersion('1.0')
    .addBearerAuth(
      {
        description: `Please enter token`,
        name: 'Authorization',
        bearerFormat: 'Bearer',
        scheme: 'Bearer',
        type: 'http',
        in: 'Header',
      },
      'access-token', // This name here is important for matching up with @ApiBearerAuth() in controller!
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);
  await app.listen(3000);
}
bootstrap();
