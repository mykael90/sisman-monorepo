import { Test, TestingModule } from '@nestjs/testing';
import { LogErrorService } from './log-error.service';

describe('LogErrorService', () => {
  let service: LogErrorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LogErrorService],
    }).compile();

    service = module.get<LogErrorService>(LogErrorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
