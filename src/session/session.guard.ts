import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { SessionService } from './session.service';

export type SessionRequest = Request & {
  user?: {
    id: number;
    name: string;
  };
};

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(
    private readonly sessionService: SessionService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<SessionRequest>();
    const sessionId = req.cookies?.sessionId;

    if (!sessionId) {
      throw new UnauthorizedException('Необходима авторизация');
    }

    const userId = await this.sessionService.getUserId(sessionId);
    if (!userId) {
      throw new UnauthorizedException('Сессия не найдена или истекла');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }

    req.user = { id: user.id, name: user.name };
    return true;
  }
}
