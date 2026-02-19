import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByIdentifier(identifier: string) {
    return this.prisma.user.findUnique({
      where: { identifier },
      include: { anonymousProfile: true },
    });
  }

  async updatePassword(user_id: number, newHash: string) {
    return this.prisma.user.update({
      where: { user_id },
      data: {
        password_hash: newHash,
        first_login: false,
      },
    });
  }

  async generateAnonymousProfile(user_id: number) {
    const existing = await this.prisma.anonymousProfile.findUnique({
      where: { user_id },
    });

    if (existing) return existing;

    const alias =
      'Student_' + Math.random().toString(36).substring(2, 7);

    return this.prisma.anonymousProfile.create({
      data: {
        user_id,
        display_name: alias,
      },
    });
  }
}
