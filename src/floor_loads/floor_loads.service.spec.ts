import { Test, TestingModule } from '@nestjs/testing';
import { FloorLoadsService } from './floor_loads.service';

describe('LoadsCalculationService', () => {
  let service: FloorLoadsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FloorLoadsService],
    }).compile();

    service = module.get<FloorLoadsService>(FloorLoadsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
