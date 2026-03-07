import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaService } from '../prisma/prisma.service';
import { Reflector } from '@nestjs/core';
import { EmailModule } from '../email/email.module';
@Module({
  providers: [UsersService, PrismaService, Reflector],
  controllers: [UsersController],
  exports: [UsersService],
  imports: [EmailModule],
})
export class UsersModule {}
