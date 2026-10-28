import { BadRequestException, Injectable } from '@nestjs/common';
import { Client } from 'minio';
import * as path from 'path';

@Injectable()
export class MinioService {
  private readonly client: Client;
  private readonly bucketName: string;

  constructor() {
    this.bucketName = process.env.MINIO_BUCKET ?? 'loads';

    this.client = new Client({
      endPoint: process.env.MINIO_ENDPOINT ?? 'localhost',
      port: Number(process.env.MINIO_PORT ?? 9000),
      useSSL: (process.env.MINIO_SSL ?? 'false') === 'true',
      accessKey: process.env.MINIO_ACCESS_KEY ?? 'minioadmin',
      secretKey: process.env.MINIO_SECRET_KEY ?? 'minioadmin',
    });
  }

  async uploadFile(file: Express.Multer.File, folder: 'images' | 'videos'): Promise<string> {
    if (!file) {
      throw new BadRequestException(`Файл для ${folder} не передан`);
    }

    const bucketExists = await this.client.bucketExists(this.bucketName).catch(() => false);
    if (!bucketExists) {
      await this.client.makeBucket(this.bucketName, 'us-east-1');
    }

    const objectName = `${folder}/${this.generateLatinFileName(file.originalname)}`;

    await this.client.putObject(
      this.bucketName,
      objectName,
      file.buffer,
      file.size,
      { 'Content-Type': file.mimetype || 'application/octet-stream' },
    );

    return path.basename(objectName);
  }

  private generateLatinFileName(originalName: string): string {
    const ext = path.extname(originalName || '').toLowerCase();
    const baseName = path.basename(originalName || '', ext);
    const transliterated = this.toLatin(baseName)
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase();

    const safeBase = transliterated || 'file';
    return `${safeBase}-${Date.now()}${ext}`;
  }

  private toLatin(value: string): string {
    const map: Record<string, string> = {
      а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i', й: 'y',
      к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f',
      х: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
      А: 'A', Б: 'B', В: 'V', Г: 'G', Д: 'D', Е: 'E', Ё: 'E', Ж: 'Zh', З: 'Z', И: 'I', Й: 'Y',
      К: 'K', Л: 'L', М: 'M', Н: 'N', О: 'O', П: 'P', Р: 'R', С: 'S', Т: 'T', У: 'U', Ф: 'F',
      Х: 'H', Ц: 'Ts', Ч: 'Ch', Ш: 'Sh', Щ: 'Sch', Ъ: '', Ы: 'Y', Ь: '', Э: 'E', Ю: 'Yu', Я: 'Ya',
    };

    return value
      .split('')
      .map((char) => map[char] ?? char)
      .join('');
  }
}
