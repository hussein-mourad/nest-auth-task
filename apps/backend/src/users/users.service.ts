import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { USER_MODEL } from './user.constants.js';
import { User, UserDocument } from './user.schema.js';

export interface CreateUserInput {
  email: string;
  name: string;
  passwordHash: string;
}

@Injectable()
export class UsersService {
  constructor(@Inject(USER_MODEL) private readonly userModel: Model<User>) {}

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.toLowerCase() });
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id);
  }

  async create(input: CreateUserInput): Promise<UserDocument> {
    return this.userModel.create({
      email: input.email.toLowerCase(),
      name: input.name,
      passwordHash: input.passwordHash,
    });
  }
}
