import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
// import { LogInterceptor } from './interceptors/log.interceptor';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import './shared/utils/bigint-tojson';
import './shared/utils/date-tojson';
import { ConfigService } from '@nestjs/config';
import { PrismaLifecycleManager } from './shared/prisma/prisma.module';
import { EmptyStringInterceptor } from './shared/interceptors/clean-empty-keys.interceptor';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT_BACKEND', 3080);
  const logger = new Logger('Bootstrap');

  // --- Bloco de Configurações Globais da Aplicação --
  // Habilita o CORS. É uma boa prática tornar as origens configuráveis.
  // Ex: configService.get('CORS_ORIGIN').split(',')
  app.enableCors({
    // origin: true // Ou especifique as origens permitidas
    origin: ['http://localhost:3000', 'https://sisman.infra.ufrn.br'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
    // allowedHeaders: ['Content-Type', 'Authorization']
  });

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
  app.useGlobalInterceptors(new EmptyStringInterceptor());

  // --- Configuração de Módulos Específicos (Swagger) --
  const config = new DocumentBuilder()
    .setTitle('Sisman')
    .setDescription('The Sisman API description')
    .setVersion('0.1')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // --- Hooks de Ciclo de Vida Personalizados (Prisma) ---
  // Obtenha a instância do nosso gerenciador de ciclo de vida
  const prismaManager = app.get(PrismaLifecycleManager);
  await prismaManager.enableShutdownHooks(app);

  //permitindo acesso publico a rotas well-known
  app.useStaticAssets(join(__dirname, 'public'));
  app.useStaticAssets(join(__dirname, 'public', '.well-known'), {
    prefix: '/.well-known'
  });

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
