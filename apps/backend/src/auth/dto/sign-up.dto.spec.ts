import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { describe, expect, it } from 'vitest';
import { SignUpDto } from './sign-up.dto.js';

function validate(payload: Record<string, unknown>) {
  const dto = plainToInstance(SignUpDto, payload);
  return validateSync(dto);
}

describe('SignUpDto', () => {
  it('accepts a valid payload', () => {
    expect(validate({ email: 'user@example.com', name: 'John Doe', password: 'Password1!' })).toHaveLength(0);
  });

  it('rejects an invalid email', () => {
    const errors = validate({ email: 'not-an-email', name: 'John Doe', password: 'Password1!' });
    expect(errors.some((e) => e.property === 'email')).toBe(true);
  });

  it('rejects a name shorter than 3 characters', () => {
    const errors = validate({ email: 'user@example.com', name: 'ab', password: 'Password1!' });
    expect(errors.some((e) => e.property === 'name')).toBe(true);
  });

  it('rejects a password shorter than 8 characters', () => {
    const errors = validate({ email: 'user@example.com', name: 'John Doe', password: 'Pass1!' });
    expect(errors.some((e) => e.property === 'password')).toBe(true);
  });

  it('rejects a password without a letter', () => {
    const errors = validate({ email: 'user@example.com', name: 'John Doe', password: '12345678!' });
    expect(errors.some((e) => e.property === 'password')).toBe(true);
  });

  it('rejects a password without a number', () => {
    const errors = validate({ email: 'user@example.com', name: 'John Doe', password: 'Password!' });
    expect(errors.some((e) => e.property === 'password')).toBe(true);
  });

  it('rejects a password without a special character', () => {
    const errors = validate({ email: 'user@example.com', name: 'John Doe', password: 'Password1' });
    expect(errors.some((e) => e.property === 'password')).toBe(true);
  });
});
