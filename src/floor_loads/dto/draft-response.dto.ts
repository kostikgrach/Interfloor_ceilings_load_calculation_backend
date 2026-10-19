import { Load } from "../../entities/load.entity";

export class DraftResponseDto {
  id: number;
  image: string;
  video: string;

  constructor(load: Load) {
    this.id = load.id;
    this.image = load.image;
    this.video = load.video;
  }
}