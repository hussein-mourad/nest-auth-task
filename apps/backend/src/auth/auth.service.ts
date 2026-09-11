import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import { UserDocument } from '../users/user.schema.js';
import { UsersService } from '../users/users.service.js';
import { SignInDto } from './dto/sign-in.dto.js';
import { SignUpDto } from './dto/sign-up.dto.js';

const BCRYPT_ROUNDS = 10;

export interface AuthResult {
  token: string;
  user: { id: string; email: string; name: string };
}

@Injectable()
export class AuthService {
  private readonly jwtExpiresSeconds: number;

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    config: ConfigService,
  ) {
    this.jwtExpiresSeconds = Number(config.get<string>('JWT_EXPIRES') ?? 86400);
  }

  get cookieMaxAgeMs(): number {
    return this.jwtExpiresSeconds * 1000;
  }

  async signUp(dto: SignUpDto): Promise<AuthResult> {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email is already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const user = await this.usersService.create({
      email: dto.email,
      name: dto.name,
      passwordHash,
    });

    return this.buildAuthResult(user);
  }

  async signIn(dto: SignInDto): Promise<AuthResult> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.buildAuthResult(user);
  }

  private async buildAuthResult(user: UserDocument): Promise<AuthResult> {
    const token = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
    });

    return {
      token,
      user: { id: user.id, email: user.email, name: user.name },
    };
  }
}
