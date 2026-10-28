import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Put, Query, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { getCurrentCreatorUserId } from '../users/users.service';
import { FloorLoadsService } from './floor_loads.service';
import { PublishCurrentDraftDto } from './dto/publish-current-draft.dto';
import { LikeLoadDto } from './dto/like-load.dto';

@Controller('api/floor-loads')
export class FloorLoadsApiController {
  constructor(
    private loadsCalculationService: FloorLoadsService,
  ) {}
  
  private readonly user_id = getCurrentCreatorUserId();
  
  @Get()
  async getLoads() {
    return await this.loadsCalculationService.getAllLoads(this.user_id);
  }
/*
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
  
    return await this.loadsCalculationService.getFilteredLoads(Number(minimum), Number(maximum), this.user_id);
  }
*/
  @Get('load')
  async getFirstPublishedLoad() {
    return await this.loadsCalculationService.getFirstPublishedLoad();
  }

  @Get('load/:id')
  async getLoad(@Param('id') id: string, @Query() query: {next?: string}) {
    const load = (query.next === 'true')
                ? await this.loadsCalculationService.getNextActiveAfter(Number(id)) 
                : await this.loadsCalculationService.getLoadById(Number(id), this.user_id)
    return load;
  }

  @Get('/draft')
  async getDraft() {
    return await this.loadsCalculationService.getDraftByUser(this.user_id);
  }

  @Post('/like')
  async toggleLike(@Body() body: LikeLoadDto) {
    await this.loadsCalculationService.setLike(Number(body.load_id), this.user_id, Number(body.like));
  }

  @Put('/add')
  async publishCurrentDraft(@Body() body: PublishCurrentDraftDto) {
    await this.loadsCalculationService.publishCurrentDraftByUser(this.user_id, {
      description: body.description,
      standard_load: Number(body.standard_load),
      reliability_coefficient: body.reliability_coefficient,
    });
  }
  
  @Post('/add')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'image', maxCount: 1 },
        { name: 'video', maxCount: 1 },
      ],
      { storage: memoryStorage() },
    ),
  )
  async saveDraft(
    @UploadedFiles()
    files: { image?: Express.Multer.File[]; video?: Express.Multer.File[] },
    @Body() body: { title: string },
  ) {
    const imageFile = files?.image?.[0];
    const videoFile = files?.video?.[0];

    await this.loadsCalculationService.addDraftWithFiles(
      body.title,
      imageFile,
      videoFile,
      this.user_id,
    );
  }
  
  @Delete('/delete/:id')
  async deleteLoad(@Param('id') id: string) {
    await this.loadsCalculationService.deleteLoad(Number(id), this.user_id);
  }  
}