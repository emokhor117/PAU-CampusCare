import { Module } from '@nestjs/common';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';
import { UsersService } from '../users/users.service';

@Module({
  controllers: [StudentsController],
  providers: [StudentsService, UsersService],
})
export class StudentsModule {}
