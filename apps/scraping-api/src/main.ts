// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3010);
  const logger = new Logger('Bootstrap');

  // Enable global validation pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties not defined in DTOs
      transform: true, // Automatically transform payloads to DTO instances
    }),
  );

  // Enable graceful shutdown hooks
  app.enableShutdownHooks();

  await app.listen(port);
  logger.log(`Application listening on port ${port}`);
  logger.log(`Node environment: ${configService.get('NODE_ENV')}`);
}
bootstrap();
