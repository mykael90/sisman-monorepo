import { Test, TestingModule } from '@nestjs/testing';
import { MaintenanceInstancesService } from './maintenance-instances.service';

describe('MaintenanceInstancesService', () => {
  let service: MaintenanceInstancesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MaintenanceInstancesService],
    }).compile();

    service = module.get<MaintenanceInstancesService>(MaintenanceInstancesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
