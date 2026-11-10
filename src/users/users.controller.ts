import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import { SessionGuard } from '../session/session.guard';
import { RegisterUserDto } from './dto/register-user.dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  @ApiOperation({ summary: 'Регистрация нового пользователя' })
  @ApiResponse({ status: 201, description: 'Пользователь создан' })
  async register(@Body() dto: RegisterUserDto) {
    return this.usersService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Авторизация пользователя по имени и паролю' })
  @ApiResponse({ status: 200, description: 'Успешный вход, сессия записана в cookie' })
  async login(
    @Body() dto: RegisterUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.usersService.login(dto);

    res.cookie('sessionId', result.sessionId, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      path: '/',
      maxAge: 60 * 60 * 1000,
    });

    return {
      ok: true,
      user: result.user,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Выход из системы' })
  @ApiCookieAuth('sessionId')
  @ApiResponse({ status: 200, description: 'Сессия удалена' })
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const sessionId = req.cookies?.sessionId as string | undefined;

    await this.usersService.logout(sessionId);
    res.clearCookie('sessionId');

    return { ok: true };
  }

  @Post('me')
  @UseGuards(SessionGuard)
  @ApiOperation({ summary: 'Получить информацию о текущем пользователе' })
  @ApiCookieAuth('sessionId')
  @ApiResponse({ status: 200, description: 'Текущий пользователь' })
  async me(@Req() req: Request & { user: { id: number; name: string } }) {
    return {
      ok: true,
      user: req.user,
    };
  }
}
