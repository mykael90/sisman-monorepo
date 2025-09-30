import { Module } from '@nestjs/common';
import { WorkersSpecialtiesController } from './workers-specialties.controller';
import { WorkersSpecialtiesService } from './workers-specialties.service';

@Module({
  controllers: [WorkersSpecialtiesController],
  providers: [WorkersSpecialtiesService],
  exports: [WorkersSpecialtiesService]
})
export class WorkersSpecialtiesModule {}
