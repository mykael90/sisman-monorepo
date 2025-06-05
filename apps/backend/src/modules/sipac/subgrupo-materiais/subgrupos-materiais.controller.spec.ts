import { Test, TestingModule } from '@nestjs/testing';
import { SubGruposMateriaisController } from './subgrupos-materiais.controller';
import { SubGruposMateriaisService } from './subgrupos-materiais.service';

describe('SubGruposMateriaisController', () => {
  let controller: SubGruposMateriaisController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubGruposMateriaisController],
      providers: [SubGruposMateriaisService]
    }).compile();

    controller = module.get<SubGruposMateriaisController>(
      SubGruposMateriaisController
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
