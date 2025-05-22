import { Global, Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService, ConfigType } from '@nestjs/config';
import { PugAdapter } from '@nestjs-modules/mailer/dist/adapters/pug.adapter';
import { join } from 'path';
import mailerConfig from '../../../config/mailer.config';

@Global()
@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [mailerConfig.KEY],
      useFactory: (config: ConfigType<typeof mailerConfig>) => ({
        transport: {
          host: config.host,
          port: config.port, // Valor padrão de 587
          auth: {
            user: config.user,
            pass: config.pass
          }
        },
        defaults: {
          from: `"SISMAN - Email automático" <${config.user}>`
        },
        template: {
          dir: join(__dirname, 'templates'), // Diretório dos templates Pug
          adapter: new PugAdapter(), // Usar o adaptador Pug
          options: {
            strict: true,
            pretty: true // Faz a saída do HTML mais legível
          }
        }
      })
    })
  ],
  providers: [EmailService],
  exports: [EmailService]
})
export class EmailModule {}
