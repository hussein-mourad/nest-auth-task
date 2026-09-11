import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { AUTH_COOKIE_NAME, AuthUser } from './auth.constants.js';

type RequestWithUser = Request & { user?: AuthUser };

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const token = request.cookies?.[AUTH_COOKIE_NAME];

    if (!token) {
      throw new UnauthorizedException('Authentication required');
    }

    try {
      request.user = await this.jwtService.verifyAsync<AuthUser>(token);
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired session');
    }
  }
}
