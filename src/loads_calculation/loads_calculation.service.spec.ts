import { Test, TestingModule } from '@nestjs/testing';
import { LoadsCalculationService } from './loads_calculation.service';

describe('LoadsCalculationService', () => {
  let service: LoadsCalculationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LoadsCalculationService],
    }).compile();

    service = module.get<LoadsCalculationService>(LoadsCalculationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
