import { Test, TestingModule } from '@nestjs/testing';
import { SipacService } from './sipac.service';

describe('SipacService', () => {
  let service: SipacService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SipacService],
    }).compile();

    service = module.get<SipacService>(SipacService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
