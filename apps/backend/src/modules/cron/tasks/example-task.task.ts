import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class ExampleTask {
  private readonly logger = new Logger(ExampleTask.name);

  @Cron(CronExpression.EVERY_10_SECONDS) // Exemplo: executa a cada 10 segundos
  handleCron() {
    this.logger.debug('Chamado a cada 10 segundos');
    // Lógica da tarefa aqui
  }

  @Cron('0 0 * * *') // Exemplo: executa todo dia à meia-noite
  dailyTask() {
    this.logger.log('Tarefa diária executada');
  }
}
