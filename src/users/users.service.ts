import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { SessionService } from '../session/session.service';
import { RegisterUserDto } from './dto/register-user.dto';

const MOCK_CURRENT_USER_ID = 1;

export const getCurrentCreatorUserId = (() => {
  let currentCreatorUserId: number | null = null;

  return (): number => {
    if (currentCreatorUserId === null) {
      currentCreatorUserId = MOCK_CURRENT_USER_ID;
    }

    return currentCreatorUserId;
  };
})();

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly sessionService: SessionService,
  ) {}

  private serializeUser(user: User): Omit<User, 'password'> {
    const { password: _password, ...rest } = user;
    return rest;
  }

  async findById(id: number): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async validateSession(sessionId: string): Promise<{ id: number; name: string }> {
    const userId = await this.sessionService.getUserId(sessionId);

    if (!userId) {
      throw new UnauthorizedException('Сессия не найдена или истекла');
    }

    const user = await this.findById(userId);
    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }

    return {
      id: user.id,
      name: user.name,
    };
  }

  async register(dto: RegisterUserDto): Promise<Omit<User, 'password'>> {
    const name = dto.name.trim();

    if (!name) {
      throw new ConflictException('Имя пользователя обязательно');
    }

    const existingUser = await this.userRepository.findOne({
      where: { name },
    });

    if (existingUser) {
      throw new ConflictException('Пользователь с таким именем уже существует');
    }

    const user = this.userRepository.create({
      name,
      password: dto.password,
    });

    const savedUser = await this.userRepository.save(user);
    return this.serializeUser(savedUser);
  }

  async login(dto: RegisterUserDto) {
    const name = dto.name.trim();
    const user = await this.userRepository.findOne({ where: { name } });

    if (!user || user.password !== dto.password) {
      throw new UnauthorizedException('Неверные учетные данные');
    }

    const sessionId = await this.sessionService.createSession(user.id);

    return {
      ok: true,
      sessionId,
      user: {
        id: user.id,
        name: user.name,
      },
    };
  }

  async logout(sessionId?: string) {
    if (sessionId) {
      await this.sessionService.destroySession(sessionId);
    }

    return { ok: true };
  }
}
