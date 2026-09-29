import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LoadsCalculationModule } from './loads_calculation/loads_calculation.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env'
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
        useFactory: (config: ConfigService) => (
          {
          type: 'postgres',
          host: config.get('DB_HOST', 'localhost'),
          port: config.get('DB_PORT', 5432),
          username: config.get('DB_USERNAME'),
          password: config.get('DB_PASSWORD'),
          database: config.get('DB_DATABASE'),
          autoLoadEntities: true,
          synchronize: false,
        }),
      }),
      LoadsCalculationModule,
    ],
})

export class AppModule {}
