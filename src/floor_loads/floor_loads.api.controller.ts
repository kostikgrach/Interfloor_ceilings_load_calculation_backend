import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { SessionGuard } from '../session/session.guard';
import { FloorLoadsService } from './floor_loads.service';
import { PublishCurrentDraftDto } from './dto/publish-current-draft.dto';
import { LikeLoadDto } from './dto/like-load.dto';

@ApiTags('Floor loads')
@Controller('api/floor-loads')
export class FloorLoadsApiController {
  constructor(
    private readonly floorLoadsService: FloorLoadsService,
  ) {}

  @Get()
  @UseGuards(SessionGuard)
  @ApiOperation({ summary: 'Список опубликованных нагрузок' })
  @ApiResponse({ status: 200, description: 'Список нагрузок' })
  async getLoads(@Req() req: { user: { id: number } }) {
    return await this.floorLoadsService.getAllLoads(req.user.id);
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
  
    return await this.floorLoadsService.getFilteredLoads(Number(minimum), Number(maximum), this.user_id);
  }
*/
  @Get(['load', 'load/:id'])
  @UseGuards(SessionGuard)
  @ApiOperation({ summary: 'Получить нагрузку по ID или первую опубликованную' })
  @ApiResponse({ status: 200, description: 'Данные нагрузки' })
  async getLoad(
    @Req() req: { user: { id: number } },
    @Param('id') id?: string,
    @Query() query?: { next?: string },
  ) {
    if (!id) {
      return await this.floorLoadsService.getFirstPublishedLoad(req.user.id);
    }

    return query?.next === 'true'
      ? await this.floorLoadsService.getNextActiveAfter(Number(id), req.user.id)
      : await this.floorLoadsService.getLoadById(Number(id), req.user.id);
  }

  @Get('/draft')
  @UseGuards(SessionGuard)
  @ApiOperation({ summary: 'Получить черновик текущего пользователя' })
  @ApiCookieAuth('sessionId')
  @ApiResponse({ status: 200, description: 'Черновик пользователя' })
  async getDraft(@Req() req: { user: { id: number } }) {
    return await this.floorLoadsService.getDraftByUser(req.user.id);
  }

  @Post('/like')
  @UseGuards(SessionGuard)
  @ApiOperation({ summary: 'Поставить/убрать лайк на нагрузке' })
  @ApiCookieAuth('sessionId')
  @ApiResponse({ status: 200, description: 'Лайк обновлён' })
  async toggleLike(
    @Req() req: { user: { id: number } },
    @Body() body: LikeLoadDto,
  ) {
    await this.floorLoadsService.setLike(Number(body.load_id), req.user.id, Number(body.like));
  }

  @Put('/add')
  @UseGuards(SessionGuard)
  @ApiOperation({ summary: 'Опубликовать текущий черновик' })
  @ApiCookieAuth('sessionId')
  @ApiResponse({ status: 200, description: 'Черновик опубликован' })
  async publishCurrentDraft(
    @Req() req: { user: { id: number } },
    @Body() body: PublishCurrentDraftDto,
  ) {
    await this.floorLoadsService.publishCurrentDraftByUser(req.user.id, {
      description: body.description,
      standard_load: Number(body.standard_load),
      reliability_coefficient: body.reliability_coefficient,
    });
  }

  @Post('/add')
  @UseGuards(SessionGuard)
  @ApiOperation({ summary: 'Создать новый черновик с изображением и видео' })
  @ApiCookieAuth('sessionId')
  @ApiResponse({ status: 201, description: 'Черновик создан' })
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
    @Req() req: { user: { id: number } },
    @UploadedFiles()
    files: { image?: Express.Multer.File[]; video?: Express.Multer.File[] },
    @Body() body: { title: string },
  ) {
    const imageFile = files?.image?.[0];
    const videoFile = files?.video?.[0];

    await this.floorLoadsService.addDraftWithFiles(
      body.title,
      imageFile,
      videoFile,
      req.user.id,
    );
  }

  @Delete('/delete/:id')
  @UseGuards(SessionGuard)
  @ApiOperation({ summary: 'Удалить нагрузку текущего пользователя' })
  @ApiCookieAuth('sessionId')
  @ApiResponse({ status: 200, description: 'Нагрузка удалена' })
  async deleteLoad(@Req() req: { user: { id: number } }, @Param('id') id: string) {
    await this.floorLoadsService.deleteLoad(Number(id), req.user.id);
  }
}