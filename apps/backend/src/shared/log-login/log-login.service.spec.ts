import { Test, TestingModule } from '@nestjs/testing';
import { logLoginService } from './log-login.service';

describe('logLoginService', () => {
  let service: logLoginService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [logLoginService],
    }).compile();

    service = module.get<logLoginService>(logLoginService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
