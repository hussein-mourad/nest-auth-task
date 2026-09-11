import type { Response } from 'express';
import { AUTH_COOKIE_NAME } from './auth.constants.js';

function cookieOptions(maxAgeMs?: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    ...(maxAgeMs !== undefined ? { maxAge: maxAgeMs } : {}),
  };
}

export function setAuthCookie(res: Response, token: string, maxAgeMs: number): void {
  res.cookie(AUTH_COOKIE_NAME, token, cookieOptions(maxAgeMs));
}

export function clearAuthCookie(res: Response): void {
  res.clearCookie(AUTH_COOKIE_NAME, cookieOptions());
}
