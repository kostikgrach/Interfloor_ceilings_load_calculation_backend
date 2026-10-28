import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Load, ServiceStatus } from '../entities/load.entity';
import { Like } from '../entities/like.entity';
import { User } from '../entities/user.entity';
import { LoadResponseDto } from './dto/load-response.dto';
import { DraftResponseDto } from './dto/draft-response.dto';
import { MinioService } from './minio.service';
import { getCurrentCreatorUserId } from '../users/users.service';

@Injectable()
export class FloorLoadsService {
  constructor(
    @InjectRepository(Load)
    private loadRepository: Repository<Load>,
    @InjectRepository(Like)
    private likeRepository: Repository<Like>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly minioService: MinioService,
  ) {}

  async getAllLoads(currentUserId: number = getCurrentCreatorUserId()): Promise<LoadResponseDto[]> {
    const loads = await this.loadRepository.find({
      where: {
        status: ServiceStatus.Published
      },  
      relations: {likes: true}
    })
    return loads.map(load => new LoadResponseDto(load, currentUserId));
  }

  async getFilteredLoads(minimum: number, maximum: number, currentUserId: number = getCurrentCreatorUserId()): Promise<LoadResponseDto[]> {
    const loads = await this.loadRepository.find({
      where: {
        status: ServiceStatus.Published,
        standard_load: Between(minimum, maximum),
      },
      relations: {likes: true}
    })
    return loads.map(load => new LoadResponseDto(load, currentUserId));
  }

  async getLoadById(id: number, currentUserId: number = getCurrentCreatorUserId()): Promise<LoadResponseDto | null> {
    const load = await this.loadRepository.findOne({where: {id: id, status: ServiceStatus.Published}, relations: {likes: true}});
    return load ? new LoadResponseDto(load, currentUserId) : null;
  }

  async getFirstPublishedLoad(): Promise<LoadResponseDto | null> {
    const load = await this.loadRepository.findOne({
      where: {
        status: ServiceStatus.Published,
      },
      order: { id: 'ASC' },
      relations: { likes: true },
    });

    return load ? new LoadResponseDto(load, getCurrentCreatorUserId()) : null;
  }

  async deleteLoad(id: number, userId: number = getCurrentCreatorUserId()): Promise<void> {
    const load = await this.loadRepository.findOne({
      where: {
        id,
        creator_id: userId,
      },
    });

    if (!load) {
      throw new ForbiddenException('Нельзя удалить чужую нагрузку');
    }

    await this.loadRepository.query(
      "UPDATE loads SET status=$1 WHERE id=$2", [ServiceStatus.Deleted, id]
    )
  }

  async getFirstId(): Promise<number | null> {
    const load = await this.loadRepository.findOne({
      where: {
        status: ServiceStatus.Published,
      },
      select: {id: true},
      order: {id: 'ASC'},
      })
    return load?.id ?? null
  }

  async getNextActiveAfter(id: number): Promise<LoadResponseDto | null> {
    const load = await this.loadRepository
      .createQueryBuilder('load')
      .leftJoinAndSelect('load.likes', 'like')
      .where('load.status = :status', { status: 'active' })
      .andWhere('load.id > :id', { id })
      .orderBy('load.id', 'ASC')
      .getOne();
    return load ? new LoadResponseDto(load) : null;
  }

  async getDraftByUser(id: number): Promise<DraftResponseDto | null> {
    const load = await this.loadRepository.findOne({
      where: {
        status: ServiceStatus.Draft,
        creator_id: id,
      }
    })
    return load ? new DraftResponseDto(load) : null;
  }

  async addDraft(title: string, image: string, video: string, user_id: number): Promise<void> {
    await this.loadRepository.insert({title: title, image: image, video: video, status: ServiceStatus.Draft, creator_id: user_id})
  }

  async addDraftWithFiles(
    title: string,
    imageFile: Express.Multer.File | undefined,
    videoFile: Express.Multer.File | undefined,
    user_id: number,
  ): Promise<void> {
    if (!title || !imageFile || !videoFile) {
      throw new BadRequestException('Название, изображение и видео обязательны');
    }

    const [imageName, videoName] = await Promise.all([
      this.minioService.uploadFile(imageFile, 'images'),
      this.minioService.uploadFile(videoFile, 'videos'),
    ]);

    await this.loadRepository.insert({
      title,
      image: imageName,
      video: videoName,
      status: ServiceStatus.Draft,
      creator_id: user_id,
    });
  }

  async setLike(loadId: number, userId: number, like: number): Promise<void> {
    const existing = await this.likeRepository.findOne({
      where: {
        load_id: loadId,
        user_id: userId,
      },
    });

    if (like === 1) {
      if (!existing) {
        await this.likeRepository.insert({
          load_id: loadId,
          user_id: userId,
        });
      }
      return;
    }

    if (like === 0 && existing) {
      await this.likeRepository.delete(existing.id);
    }
  }

  async publishLoad(id: number, 
                    title: string, 
                    description: string, 
                    standard_load: number, 
                    reliability_coefficient: string,
                    image: string, 
                    video: string): Promise<void> {
    await this.loadRepository.update({id: id}, {
      title: title,
      description: description,
      standard_load: standard_load,
      reliability_coefficient: reliability_coefficient,
      image: image,
      video: video,
      status: ServiceStatus.Published,
      formation_date: new Date(),
    })
  }

  async publishCurrentDraftByUser(userId: number, data: {
    description: string,
    standard_load: number,
    reliability_coefficient: string,
  }): Promise<void> {
    const draft = await this.loadRepository.findOne({
      where: {
        creator_id: userId,
        status: ServiceStatus.Draft,
      },
      order: { id: 'DESC' },
    });

    if (!draft) {
      return;
    }

    await this.loadRepository.update(draft.id, {
      description: data.description,
      standard_load: data.standard_load,
      reliability_coefficient: data.reliability_coefficient,
      status: ServiceStatus.Published,
      formation_date: new Date(),
    });
  }
}
