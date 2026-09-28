import { Module } from '@nestjs/common';
import { LoadsCalculationController } from './loads_calculation.controller';
import { LoadsCalculationService } from './loads_calculation.service';

@Module({
  controllers: [LoadsCalculationController],
  providers: [LoadsCalculationService],
})
export class LoadsCalculationModule {}
