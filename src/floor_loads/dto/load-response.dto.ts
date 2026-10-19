import { Load } from "../../entities/load.entity";

export class LoadResponseDto {
  id: number;
  title: string;
  description: string;
  standard_load: number;
  reliability_coefficient: number;
  image: string;
  video: string;
  likes: number[];

  constructor(load: Load) {
    this.id = load.id;
    this.title = load.title;
    this.description = load.description!;
    this.standard_load = load.standard_load!;
    this.reliability_coefficient = Number(load.reliability_coefficient!);
    this.image = load.image;
    this.video = load.video;
    this.likes = load.likes!.map((like) => like.id);
  }
}