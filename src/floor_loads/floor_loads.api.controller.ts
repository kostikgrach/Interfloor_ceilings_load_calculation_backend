import { BadRequestException, Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { FloorLoadsService } from './floor_loads.service';

//TODO: Add registration of users and belonging of loads to users.
@Controller('api/floor-loads')
export class FloorLoadsApiController {
  constructor(
    private loadsCalculationService: FloorLoadsService,
  ) {}
  
  private user_id = 1;
  
  @Get()
  async getLoads() {
    return await this.loadsCalculationService.getAllLoads();
  }

  @Post()
  async searchOrders(@Body() body: { min?: string, max?: string }) {
    const MIN = 0;
    const MAX = 500;
  
    let minimum = body?.min !== undefined && body.min !== '' ? Number(body.min) : MIN;
    let maximum = body?.max !== undefined && body.max !== '' ? Number(body.max) : MAX;
    if (minimum < MIN) throw  new BadRequestException(`Minimum value must be greater than or equal to ${MIN}`);
    if (minimum > MAX) throw  new BadRequestException(`Minimum value must be less than or equal to ${MAX}`);
    if (maximum < MIN) throw  new BadRequestException(`Maximum value must be greater than or equal to ${MIN}`);
    if (maximum > MAX) throw  new BadRequestException(`Maximum value must be less than or equal to ${MAX}`);
    if (minimum > maximum) throw  new BadRequestException(`Minimum value must be less than or equal to maximum value`);
  
    return await this.loadsCalculationService.getFilteredLoads(Number(minimum), Number(maximum));
  }
  
  // TODO: Add no id search
  @Get('load/:id')
  async getLoad(@Param('id') id: string, @Query() query: {next?: string}) {
    const load = (query.next === 'true')
                ? await this.loadsCalculationService.getNextActiveAfter(Number(id)) 
                : await this.loadsCalculationService.getLoadById(Number(id))
    return load;
  }
  
  @Post('/add')
  async saveDraft(@Body() body: { title: string, image: string, video: string }) {
    this.loadsCalculationService.addDraft(body.title, body.image, body.video, this.user_id)
  }
  
  @Post('/add/:id')
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
  async delete_load(@Param('id') id: string) {
    await this.loadsCalculationService.deleteLoad(Number(id));
  }  
}