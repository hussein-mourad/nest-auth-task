import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Connection, createConnection } from 'mongoose';

export const DATABASE_CONNECTION = 'DATABASE_CONNECTION';

@Module({
  providers: [
    {
      provide: DATABASE_CONNECTION,
      inject: [ConfigService],
      useFactory: (config: ConfigService): Promise<Connection> => {
        const uri = config.get<string>('MONGODB_URI') ?? 'mongodb://localhost:27017/nest-auth';
        return createConnection(uri).asPromise();
      },
    },
  ],
  exports: [DATABASE_CONNECTION],
})
export class DatabaseModule {}
