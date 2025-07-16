import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
// import { LogInterceptor } from './interceptors/log.interceptor';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import 'src/shared/utils/bigint-tojson';
import 'src/shared/utils/date-tojson';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT_BACKEND', 3080);
  const logger = new Logger('Bootstrap');

  // Habilita o CORS. É uma boa prática tornar as origens configuráveis.
  // Ex: configService.get('CORS_ORIGIN').split(',')
  // app.enableCors({
  //   origin: true, // Ou especifique as origens permitidas
  //   credentials: true
  // });

  // Remove propriedades não listadas no DTO
  // Transforma o payload para o tipo do DTO
  // LANÇA UM ERRO se propriedades não listadas forem encontradas
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true
      }
    })
  );

  // Habilitar o hook de encerramento do NestJS, aguarda as requisições terminarem além de bloquear novas requisições
  app.enableShutdownHooks();

  // app.useGlobalInterceptors(new LogInterceptor());

  const config = new DocumentBuilder()
    .setTitle('Sisman')
    .setDescription('The Sisman API description')
    .setVersion('0.1')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(port);
  logger.log(`🚀 Aplicação rodando em: http://localhost:${port}`);
  logger.log(
    `📄 Documentação do Swagger disponível em: http://localhost:${port}/api`
  );

  // Se o modo de desenvolvimento estiver ativo, inicie o debugger manualmente
  if (process.env.DEBUG_MODE === 'yes') {
    const inspector = await import('inspector');
    inspector.open(9229, '0.0.0.0'); // Abra o debugger na porta 9229 para todas as interfaces
    logger.log('Debugger listening on port 9229');
  }
}

bootstrap();
