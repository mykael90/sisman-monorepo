import { Test, TestingModule } from '@nestjs/testing';
import { ListaRequisicoesMateriaisService } from './lista-requisicoes-materiais.service';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { SipacScrapingService } from '../sipac-scraping.service';

describe('RequisicoesMateriaisService', () => {
  let service: ListaRequisicoesMateriaisService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListaRequisicoesMateriaisService,
        // Mock PrismaService
        {
          provide: PrismaService,
          useValue: {
            // Mock any Prisma methods used in RequisicoesMateriaisService
            // For now, since persistence is commented out, we might not need extensive mocks.
            // If persistence is re-enabled, add mocks like:
            // sipacRequisicaoMaterial: {
            //   createMany: jest.fn(),
            // },
          }
        },
        // Mock SipacScrapingService
        {
          provide: SipacScrapingService,
          useValue: {
            get: jest.fn() // Mock the 'get' method
          }
        }
      ]
    }).compile();

    service = module.get<ListaRequisicoesMateriaisService>(
      ListaRequisicoesMateriaisService
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
