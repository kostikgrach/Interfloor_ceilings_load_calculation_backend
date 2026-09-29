import { Module } from '@nestjs/common';
import { LoadsCalculationController } from './loads_calculation.controller';
import { LoadsCalculationService } from './loads_calculation.service';
import { User } from './entities/user.entity';
import { Load } from './entities/load.entity';
import { Like } from './entities/like.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([User, Load, Like])],
  controllers: [LoadsCalculationController],
  providers: [LoadsCalculationService],
})
export class LoadsCalculationModule {}
