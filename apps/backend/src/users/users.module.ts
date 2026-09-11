import { Module } from '@nestjs/common';
import { Connection } from 'mongoose';
import { DATABASE_CONNECTION, DatabaseModule } from '../database/database.module.js';
import { USER_MODEL } from './user.constants.js';
import { UserSchema } from './user.schema.js';
import { UsersController } from './users.controller.js';
import { UsersService } from './users.service.js';

@Module({
  imports: [DatabaseModule],
  controllers: [UsersController],
  providers: [
    {
      provide: USER_MODEL,
      inject: [DATABASE_CONNECTION],
      useFactory: (connection: Connection) => connection.model('User', UserSchema),
    },
    UsersService,
  ],
  exports: [UsersService],
})
export class UsersModule {}
