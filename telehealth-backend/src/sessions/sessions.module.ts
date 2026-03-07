import { Module } from '@nestjs/common';
import { SessionsController } from './sessions.controller';
import { SessionsService } from './sessions.service';
import { EmailModule } from 'src/email/email.module';
@Module({
  controllers: [SessionsController],
  providers: [SessionsService],
  exports: [SessionsService],
  imports: [EmailModule],
})
export class SessionsModule {}
