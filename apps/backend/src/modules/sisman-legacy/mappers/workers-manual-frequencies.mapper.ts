import { Injectable } from '@nestjs/common';
import { WorkerManualFrequencyCreateDto } from '../../workers-manual-frequencies/dto/worker-manual-frequency.dto';
import { SismanLegacyWorkerManualFrequencyResponse } from '../sisman-legacy-api.interfaces';
import { getNowFormatted } from '../../../shared/utils/date-utils';

@Injectable()
export class WorkerManualFrequencyMapper {
  toCreateDto(
    item: SismanLegacyWorkerManualFrequencyResponse
  ): WorkerManualFrequencyCreateDto {
    const notes = [
      `IMPORTADO DO SISMAN LEGACY EM ${getNowFormatted()}`,
      item.obs,
      item.WorkerManualfrequency.obs
    ]
      .filter(Boolean)
      .join(' \n ');

    return {
      workerId: item.WorkerId,
      date: new Date(item.WorkerManualfrequency.date),
      hours: item.hours,
      workerManualFrequencyTypeId: item.WorkerManualfrequencytypeId,
      userId: item.WorkerManualfrequency.UserId,
      notes
    };
  }
}
