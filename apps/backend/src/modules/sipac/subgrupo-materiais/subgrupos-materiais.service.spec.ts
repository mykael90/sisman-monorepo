import { Test, TestingModule } from '@nestjs/testing';
import { SubGruposMateriaisService } from './subgrupos-materiais.service';

describe('SubGruposMateriaisService', () => {
  let service: SubGruposMateriaisService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SubGruposMateriaisService]
    }).compile();

    service = module.get<SubGruposMateriaisService>(SubGruposMateriaisService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
