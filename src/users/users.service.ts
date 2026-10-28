import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
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
  ) {}

  async register(dto: RegisterUserDto): Promise<Omit<User, 'password'>> {
    const name = dto.name.trim();
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
    const { password: _password, ...result } = savedUser;

    return result;
  }

  async login(dto: RegisterUserDto) {
    const name = dto.name.trim();

    return {
      ok: true,
      message: 'Аутентификация временно заглушена',
      login: true,
      user: {
        id: MOCK_CURRENT_USER_ID,
        name: 'creator',
      },
    };
  }

  async logout() {
    return null;
  }
}
