import { Test, TestingModule } from '@nestjs/testing';
import { MaintenanceInstancesController } from './maintenance-instances.controller';
import { MaintenanceInstancesService } from './maintenance-instances.service';

describe('MaintenanceInstancesController', () => {
  let controller: MaintenanceInstancesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MaintenanceInstancesController],
      providers: [MaintenanceInstancesService]
    }).compile();

    controller = module.get<MaintenanceInstancesController>(
      MaintenanceInstancesController
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
