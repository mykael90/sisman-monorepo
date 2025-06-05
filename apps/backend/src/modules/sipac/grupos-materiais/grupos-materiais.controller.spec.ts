import { Test, TestingModule } from '@nestjs/testing';
import { GruposMateriaisController } from './grupos-materiais.controller';
import { GruposMateriaisService } from './grupos-materiais.service';

describe('GruposMateriaisController', () => {
  let controller: GruposMateriaisController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GruposMateriaisController],
      providers: [GruposMateriaisService]
    }).compile();

    controller = module.get<GruposMateriaisController>(
      GruposMateriaisController
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
