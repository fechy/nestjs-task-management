import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import * as config from 'config';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('bootstrap');

  const serverConfig = config.get('server');

  const app = await NestFactory.create(AppModule);

  if (process.env.NODE_ENV === 'development') {
    app.enableCors();
  } else {
    app.enableCors({
      origin: serverConfig.origin,
    });
    logger.log(`Accepting requets from origin ${serverConfig.origin}`);
  }

  const port = process.env.PORT || serverConfig.port;
  await app.listen(port);

  logger.log(`Application listening on port ${port}`);
}
bootstrap();
