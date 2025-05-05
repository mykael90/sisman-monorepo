// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller'; // Optional: for root endpoint
import { SipacModule } from './sipac/sipac.module';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Make ConfigService available globally
      envFilePath: '.env', // Load .env file
    }),
    ScheduleModule.forRoot(), // Initialize scheduling
    SipacModule, // Import our feature module
  ],
  controllers: [AppController], // Optional
  providers: [AppService],
})
export class AppModule {}
