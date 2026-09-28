import { Module } from '@nestjs/common';
import { LoadsCalculationModule } from './loads_calculation/loads_calculation.module';

@Module({
  imports: [
    LoadsCalculationModule,
  ],
})
export class AppModule {}
