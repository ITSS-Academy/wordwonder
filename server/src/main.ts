import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as admin from 'firebase-admin';
import { HttpExceptionFilter } from './utils/custom_http_exception_filter';
import { ValidationPipe } from '@nestjs/common';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(bodyParser.json({ limit: '100mb' }));
  app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));
  app.enableCors();
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(new ValidationPipe());
  admin.initializeApp({
    credential: admin.credential.cert('firebase-admin-key.json'),
  });
  await app.listen(4444);
  console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap()
  .then(() => console.log('Boom Boom Chiu Chiu!!!'))
  .catch((e) => console.error(e));
