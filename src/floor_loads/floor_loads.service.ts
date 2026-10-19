import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Load, ServiceStatus } from '../entities/load.entity';
import { Like } from '../entities/like.entity';
import { User } from '../entities/user.entity';
import { LoadResponseDto } from './dto/load-response.dto';
import { DraftResponseDto } from './dto/draft-response.dto';

@Injectable()
export class FloorLoadsService {
  constructor(
    @InjectRepository(Load)
    private loadRepository: Repository<Load>,
    @InjectRepository(Like)
    private likeRepository: Repository<Like>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getAllLoads(): Promise<LoadResponseDto[]> {
    const loads = await this.loadRepository.find({
      where: {
        status: ServiceStatus.Published
      },  
      relations: {likes: true}
    })
    return loads.map(load => new LoadResponseDto(load));
  }

  async getFilteredLoads(minimum: number, maximum: number): Promise<LoadResponseDto[]> {
    const loads = await this.loadRepository.find({
      where: {
        status: ServiceStatus.Published,
        standard_load: Between(minimum, maximum),
      },
      relations: {likes: true}
    })
    return loads.map(load => new LoadResponseDto(load));
  }

  async getLoadById(id: number): Promise<LoadResponseDto | null> {
    const load = await this.loadRepository.findOne({where: {id: id, status: ServiceStatus.Published}, relations: {likes: true}});
    return load ? new LoadResponseDto(load) : null;
  }

  async deleteLoad(id: number): Promise<void> {
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
      })
    return load?.id ?? null
  }

  async getNextActiveAfter(id: number): Promise<LoadResponseDto | null> {
    const load = await this.loadRepository
      .createQueryBuilder('load')
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
}
