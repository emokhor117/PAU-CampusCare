import { Module } from '@nestjs/common';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';
import { UsersService } from '../users/users.service';
import { EmailModule } from 'src/email/email.module';
@Module({
  controllers: [StudentsController],
  providers: [StudentsService, UsersService],
  imports: [EmailModule],
})
export class StudentsModule {}
