import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { StudentsModule } from './students/students.module';
import { AssessmentsModule } from './assessments/assessments.module';
import { SessionsModule } from './sessions/sessions.module';
import { PrismaModule } from './prisma/prisma.module';


@Module({
  imports: [PrismaModule, AuthModule, StudentsModule, AssessmentsModule, SessionsModule]
})
export class AppModule {}
