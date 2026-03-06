import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaService } from '../prisma/prisma.service';
import { Reflector } from '@nestjs/core';
@Module({
  providers: [UsersService, PrismaService, Reflector],
  controllers: [UsersController],
  exports: [UsersService]
})
export class UsersModule {}
