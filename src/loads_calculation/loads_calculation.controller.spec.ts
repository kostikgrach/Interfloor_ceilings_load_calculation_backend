import { Test, TestingModule } from '@nestjs/testing';
import { LoadsCalculationController } from './loads_calculation.controller';

describe('LoadsCalculationController', () => {
  let controller: LoadsCalculationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LoadsCalculationController],
    }).compile();

    controller = module.get<LoadsCalculationController>(LoadsCalculationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
