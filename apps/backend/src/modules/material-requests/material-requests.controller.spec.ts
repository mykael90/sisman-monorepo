import { Test, TestingModule } from '@nestjs/testing';
import { MaterialRequestsController } from './material-requests.controller';
import { MaterialRequestsService } from './material-requests.service';

describe('MaterialRequestsController', () => {
  let controller: MaterialRequestsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MaterialRequestsController],
      providers: [MaterialRequestsService]
    }).compile();

    controller = module.get<MaterialRequestsController>(
      MaterialRequestsController
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
