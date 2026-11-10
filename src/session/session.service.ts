import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import { randomUUID } from 'crypto';

@Injectable()
export class SessionService implements OnModuleDestroy {
  private readonly redis: Redis;

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST ?? 'localhost',
      port: Number(process.env.REDIS_PORT ?? 6379),
      db: Number(process.env.REDIS_DB ?? 0),
    });

    this.redis.on('error', (err) => {
      console.error('Redis session store error:', err);
    });
  }

  async createSession(userId: number, ttlSec = 3600): Promise<string> {
    const sessionId = randomUUID();
    await this.redis.set(`session:${sessionId}`, String(userId), 'EX', ttlSec);
    return sessionId;
  }

  async getUserId(sessionId: string): Promise<number | null> {
    const userIdValue = await this.redis.get(`session:${sessionId}`);

    if (!userIdValue) {
      return null;
    }

    const userId = Number(userIdValue);
    return Number.isFinite(userId) ? userId : null;
  }

  async destroySession(sessionId: string): Promise<void> {
    await this.redis.del(`session:${sessionId}`);
  }

  async sessionExists(sessionId: string): Promise<boolean> {
    const result = await this.redis.exists(`session:${sessionId}`);
    return result === 1;
  }

  async onModuleDestroy(): Promise<void> {
    await this.redis.quit();
  }
}
