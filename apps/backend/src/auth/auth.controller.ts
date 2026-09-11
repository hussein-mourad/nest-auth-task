import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import type { Response } from 'express';
import { clearAuthCookie, setAuthCookie } from './auth.cookie.js';
import { AuthService } from './auth.service.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import { SignInDto } from './dto/sign-in.dto.js';
import { SignUpDto } from './dto/sign-up.dto.js';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @ApiCreatedResponse({ description: 'User created and session cookie set' })
  async signUp(@Body() dto: SignUpDto, @Res({ passthrough: true }) res: Response) {
    const { token, user } = await this.authService.signUp(dto);
    setAuthCookie(res, token, this.authService.cookieMaxAgeMs);
    return { user };
  }

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'Signed in and session cookie set' })
  @ApiUnauthorizedResponse({ description: 'Invalid email or password' })
  async signIn(@Body() dto: SignInDto, @Res({ passthrough: true }) res: Response) {
    const { token, user } = await this.authService.signIn(dto);
    setAuthCookie(res, token, this.authService.cookieMaxAgeMs);
    return { user };
  }

  @Post('signout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ description: 'Session cookie cleared' })
  signOut(@Res({ passthrough: true }) res: Response): { message: string } {
    clearAuthCookie(res);
    return { message: 'Signed out' };
  }
}
