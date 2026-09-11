import { plainToInstance } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, Matches, validateSync } from 'class-validator';

class EnvironmentVariables {
  @IsOptional()
  @IsString()
  MONGODB_URI?: string;

  @IsString()
  @IsNotEmpty()
  JWT_SECRET!: string;

  @IsOptional()
  @Matches(/^\d+$/, { message: 'JWT_EXPIRES must be a number of seconds' })
  JWT_EXPIRES?: string;

  @IsOptional()
  @Matches(/^\d+$/, { message: 'PORT must be a number' })
  PORT?: string;

  @IsOptional()
  @IsString()
  FRONTEND_ORIGIN?: string;
}

export function validate(config: Record<string, unknown>): Record<string, unknown> {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validated, { whitelist: true });
  if (errors.length > 0) {
    const messages = errors
      .map((error) => Object.values(error.constraints ?? {}).join(', '))
      .join('; ');
    throw new Error(`Invalid environment configuration: ${messages}`);
  }

  return config;
}
