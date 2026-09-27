import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

const hbs = require('hbs'); 

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setViewEngine('hbs');

  hbs.registerHelper('eq', (a: unknown, b: unknown) => a === b);

  hbs.registerPartials(join(__dirname, '..', 'views/partials'));
  
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
