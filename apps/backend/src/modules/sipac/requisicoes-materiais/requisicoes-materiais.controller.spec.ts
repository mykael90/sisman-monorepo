import { Test, TestingModule } from '@nestjs/testing';
import { RequisicoesMateriaisController } from './requisicoes-materiais.controller';
import { ListaRequisicoesMateriaisService } from './lista-requisicoes-materiais.service';

describe('RequisicoesMateriaisController', () => {
  let controller: RequisicoesMateriaisController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RequisicoesMateriaisController],
      providers: [
        // Mock RequisicoesMateriaisService
        {
          provide: ListaRequisicoesMateriaisService,
          useValue: {
            testFetchRequisicoesMateriais: jest.fn(),
            fetchAllAndPersistRequisicoesMateriais: jest.fn(),
            fetchByIdAndPersistRequisicaoMaterial: jest.fn(),
            fetchManyByCodesAndPersistRequisicoesMateriais: jest.fn()
          }
        }
      ]
    }).compile();

    controller = module.get<RequisicoesMateriaisController>(
      RequisicoesMateriaisController
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
