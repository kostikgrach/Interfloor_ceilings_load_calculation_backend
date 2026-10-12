import { Module } from '@nestjs/common';
import { FloorLoadsController } from './floor_loads.controller';
import { FloorLoadsService } from './floor_loads.service';

@Module({
  controllers: [FloorLoadsController],
  providers: [FloorLoadsService],
})
export class FloorLoadsModule {}
