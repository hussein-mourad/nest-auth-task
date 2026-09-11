import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import bcrypt from 'bcryptjs';
import { describe, expect, it, vi } from 'vitest';
import { AuthService } from './auth.service.js';
import { UserDocument } from '../users/user.schema.js';
import { UsersService } from '../users/users.service.js';

describe('AuthService', () => {
  let service: AuthService;

  const usersService = {
    findByEmail: vi.fn(),
    create: vi.fn(),
  };

  const jwtService = {
    signAsync: vi.fn().mockResolvedValue('signed-token'),
  };

  const configService = {
    get: (key: string, fallback?: unknown) => {
      const values: Record<string, string> = { JWT_EXPIRES: '86400' };
      return values[key] ?? fallback;
    },
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  describe('signUp', () => {
    const dto = { email: 'user@example.com', name: 'John Doe', password: 'Password1!' };

    it('hashes the password and returns a token with the user', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      usersService.create.mockImplementation(async (input: { passwordHash: string }) => ({
        id: '507f1f77bcf86cd799439011',
        email: dto.email,
        name: dto.name,
        passwordHash: input.passwordHash,
      }));

      const result = await service.signUp(dto);

      const createdInput = usersService.create.mock.calls[0][0];
      expect(await bcrypt.compare(dto.password, createdInput.passwordHash)).toBe(true);
      expect(createdInput.passwordHash).not.toBe(dto.password);

      expect(result.token).toBe('signed-token');
      expect(result.user).toEqual({ id: '507f1f77bcf86cd799439011', email: dto.email, name: dto.name });
    });

    it('rejects an email that is already registered', async () => {
      usersService.findByEmail.mockResolvedValue({ email: dto.email } as UserDocument);

      await expect(service.signUp(dto)).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('signIn', () => {
    const dto = { email: 'user@example.com', password: 'Password1!' };

    it('returns a token when credentials are valid', async () => {
      usersService.findByEmail.mockResolvedValue({
        id: '507f1f77bcf86cd799439011',
        email: dto.email,
        name: 'John Doe',
        passwordHash: await bcrypt.hash(dto.password, 10),
      });

      const result = await service.signIn(dto);

      expect(result.token).toBe('signed-token');
      expect(result.user.email).toBe(dto.email);
    });

    it('rejects an unknown email', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(service.signIn(dto)).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('rejects an incorrect password', async () => {
      usersService.findByEmail.mockResolvedValue({
        id: '507f1f77bcf86cd799439011',
        email: dto.email,
        name: 'John Doe',
        passwordHash: await bcrypt.hash('SomethingElse1!', 10),
      });

      await expect(service.signIn(dto)).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });
});
