import { Test, TestingModule } from '@nestjs/testing';
import { SipacController } from './sipac.controller';
import { SipacService } from './sipac.service';

describe('SipacController', () => {
  let controller: SipacController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SipacController],
      providers: [SipacService],
    }).compile();

    controller = module.get<SipacController>(SipacController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
