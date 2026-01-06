import { Module } from '@nestjs/common';
import { SurveyResponsesController } from './survey-responses.controller';
import { SurveyResponsesService } from './survey-responses.service';

@Module({
  controllers: [SurveyResponsesController],
  providers: [SurveyResponsesService],
  exports: [SurveyResponsesService]
})
export class SurveyResponsesModule {}
