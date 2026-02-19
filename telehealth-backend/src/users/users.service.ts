import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Role } from '../common/utils/roles.enum';

@Injectable()
export class UsersService {
  private users = [
    {
      user_id: 1,
      identifier: 'PAU/CSC/001',
      password_hash: bcrypt.hashSync('password123', 10),
      role: Role.STUDENT,
      first_login: true,
      anon_id: 'anon-abc-123',
    },
    {
      user_id: 2,
      identifier: 'STAFF/COUNS/01',
      password_hash: bcrypt.hashSync('password123', 10),
      role: Role.COUNSELLOR,
      first_login: true,
    },
    {
      user_id: 3,
      identifier: 'ADMIN/01',
      password_hash: bcrypt.hashSync('password123', 10),
      role: Role.ADMIN,
      first_login: true,
    },
  ];

  async findByIdentifier(identifier: string) {
    return this.users.find(u => u.identifier === identifier);
  }

  async updatePassword(user_id: number, newHash: string) {
    const user = this.users.find(u => u.user_id === user_id);
    if (user) {
      user.password_hash = newHash;
      user.first_login = false;
    }
    return user;
  }
}
