import { Test, TestingModule } from '@nestjs/testing';
import { FloorLoadsController } from './floor_loads.controller';

describe('LoadsCalculationController', () => {
  let controller: FloorLoadsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FloorLoadsController],
    }).compile();

    controller = module.get<FloorLoadsController>(FloorLoadsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
