import { Controller, Get, Post, Param, Query, Render, Body, Res, Put, Redirect } from '@nestjs/common';
import { LoadsCalculationService } from './loads_calculation.service';
import { Response } from 'express';

export interface Load {
  id: number,
  title: string,
  description: string,
  standart_load: number,
  reliability_coefficient: number,
  image: string,
  video: string,
  status: string,
  likes: number[],
}

@Controller('load-calculation')
export class LoadsCalculationController {
  constructor(
    private loadsCalculationService: LoadsCalculationService,
  ) {}

  private user_id = 1;
  
  @Get()
  @Render('main')
  async getLoads() {
    return {
      title: 'Load List',
      data: {
        current_date: new Date().toLocaleDateString(),
        loads: await this.loadsCalculationService.getAllLoads(),
        first_id: await this.loadsCalculationService.getFirstId(),
        active: 0,
      },
    };
  }

  @Post()
  @Render('main')
  async searchLoads(@Body() body: { minimum?: string, maximum?: string }) {
    const minimum = body?.minimum || '0';
    const maximum = body?.maximum || '500';

    return {
      title: 'Список заказов',
      name: 'BMSTU',
      data: {
        current_date: new Date().toLocaleDateString(),
        loads: await this.loadsCalculationService.getFilteredLoads(Number(minimum), Number(maximum)),
        first_id: await this.loadsCalculationService.getFirstId(),
        active: 0,
        minimum: minimum,
        maximum: maximum,
      },
    };
  }

  @Get('load/:id')
  @Render('load')
  async getLoad(@Param('id') id: string, @Query() query: {next?: string}) {
    const load = (query.next === 'true')
                ? await this.loadsCalculationService.getNextActiveAfter(Number(id)) 
                : await this.loadsCalculationService.getLoadById(Number(id))
    return {
      title: load ? load.title : 'Не найдено',
      data: {
        id: load?.id,
        current_date: new Date().toLocaleDateString(),
        load: load,
        first_id: await this.loadsCalculationService.getFirstId(),
        active: 2
      },
    };
  }

  @Get('/add')
  async addLoad(@Res() res: Response) {
    const draft = await this.loadsCalculationService.getDraftByUser(this.user_id);
    if (draft) {
      return res.render('public', {
        title: 'Опубликовать',
        data: {
          load: draft,
          first_id: await this.loadsCalculationService.getFirstId(),
          active: 1,
        }
      })
    } else {
      return res.render('add', {
        title: 'Добавить',
        data: {
          first_id: await this.loadsCalculationService.getFirstId(),
          active: 1,
        }
      })
    }
  }

  @Post('/add')
  @Redirect('/load-calculation/add')
  async saveDraft(@Body() body: { title: string, image: string, video: string }) {
    this.loadsCalculationService.addDraft(body.title, body.image, body.video, this.user_id)
  }

  @Post('/add/:id')
  @Redirect('/load-calculation')
  async publish_load(@Param('id') id: string, @Body() body: {
    title: string,
    description: string,
    standard_load: string,
    reliability_coefficient: string,
    video: string,
    image: string,
  }) {
    await this.loadsCalculationService.publishLoad(
      Number(id),
      body.title,
      body.description,
      Number(body.standard_load),
      body.reliability_coefficient,
      body.image,
      body.video,
    );
  }

  @Post('/delete/:id')
  @Redirect('/load-calculation', 302)
  async delete_load(@Param('id') id: string) {
    await this.loadsCalculationService.deleteLoad(Number(id));
  }
}
