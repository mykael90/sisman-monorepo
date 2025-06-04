import { Test, TestingModule } from '@nestjs/testing';
import { MateriaisController } from './materiais.controller';
import { MateriaisService } from './materiais.service';

describe('MateriaisController', () => {
  let controller: MateriaisController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MateriaisController],
      providers: [MateriaisService],
    }).compile();

    controller = module.get<MateriaisController>(MateriaisController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
