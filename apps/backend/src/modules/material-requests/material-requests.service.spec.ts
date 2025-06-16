import { Test, TestingModule } from '@nestjs/testing';
import { MaterialRequestsService } from './material-requests.service';

describe('MaterialRequestsService', () => {
  let service: MaterialRequestsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MaterialRequestsService]
    }).compile();

    service = module.get<MaterialRequestsService>(MaterialRequestsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
