import { Test, TestingModule } from '@nestjs/testing';
import { FloorLoadsApiController } from './floor_loads.api.controller';

describe('FloorLoadsApiController', () => {
  let controller: FloorLoadsApiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FloorLoadsApiController],
    }).compile();

    controller = module.get<FloorLoadsApiController>(FloorLoadsApiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
