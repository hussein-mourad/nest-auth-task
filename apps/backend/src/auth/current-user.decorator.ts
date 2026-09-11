import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { AuthUser } from './auth.constants.js';

type RequestWithUser = Request & { user?: AuthUser };

export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext): AuthUser => {
  const request = ctx.switchToHttp().getRequest<RequestWithUser>();
  if (!request.user) {
    throw new UnauthorizedException('Authentication required');
  }
  return request.user;
});
