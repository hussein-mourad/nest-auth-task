import { Controller, Get, NotFoundException, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { CurrentUser } from '../auth/current-user.decorator.js';
import type { AuthUser } from '../auth/auth.constants.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { UsersService } from './users.service.js';

@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access_token')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOkResponse({ description: 'The authenticated user' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid session cookie' })
  async me(@CurrentUser() user: AuthUser): Promise<{ id: string; email: string; name: string }> {
    const found = await this.usersService.findById(user.sub);
    if (!found) {
      throw new NotFoundException('User not found');
    }

    return { id: found.id, email: found.email, name: found.name };
  }
}
