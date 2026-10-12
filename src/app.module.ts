import { Module } from '@nestjs/common';
import { FloorLoadsModule } from './floor_loads/floor_loads.module';

@Module({
  imports: [
    FloorLoadsModule,
  ],
})
export class AppModule {}
