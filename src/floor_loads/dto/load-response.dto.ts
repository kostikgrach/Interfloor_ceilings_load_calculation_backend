import { Load } from "../../entities/load.entity";
import { getCurrentCreatorUserId } from '../../users/users.service';

export class LoadResponseDto {
  id: number;
  title: string;
  description: string;
  standard_load: number;
  reliability_coefficient: number;
  image: string;
  video: string;
  likes: number[];
  is_owner: number;
  is_liked: number;

  constructor(load: Load, currentUserId: number = getCurrentCreatorUserId()) {
    this.id = load.id;
    this.title = load.title;
    this.description = load.description!;
    this.standard_load = load.standard_load!;
    this.reliability_coefficient = Number(load.reliability_coefficient!);
    this.image = load.image;
    this.video = load.video;
    this.likes = load.likes?.map((like) => like.id) ?? [];
    this.is_owner = Number(load.creator_id === currentUserId);
    this.is_liked = Number(load.likes?.some((like) => like.user_id === currentUserId) ?? false);
  }
}