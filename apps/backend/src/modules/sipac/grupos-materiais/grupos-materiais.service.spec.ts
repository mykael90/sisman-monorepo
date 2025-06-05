import { Test, TestingModule } from '@nestjs/testing';
import { GruposMateriaisService } from './grupos-materiais.service';

describe('GruposMateriaisService', () => {
  let service: GruposMateriaisService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GruposMateriaisService]
    }).compile();

    service = module.get<GruposMateriaisService>(GruposMateriaisService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
