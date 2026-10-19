import { Module } from '@nestjs/common';
import { FloorLoadsController } from './floor_loads.controller';
import { FloorLoadsService } from './floor_loads.service';
import { User } from '../entities/user.entity';
import { Load } from '../entities/load.entity';
import { Like } from '../entities/like.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([User, Load, Like])],
  controllers: [FloorLoadsController],
  providers: [FloorLoadsService],
})
export class FloorLoadsModule {}
