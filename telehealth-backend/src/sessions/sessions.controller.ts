import { Controller, Post, UseGuards, Req, Get, Param, Body } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/utils/roles.enum';


@Controller('sessions')
export class SessionsController {
  constructor(private sessionsService: SessionsService) {}

  @UseGuards(JwtAuthGuard)
  @Roles(Role.STUDENT)
  @Post('start')
  startSession(@Req() req) {
    const anon_id = req.user.anon_id;
    return this.sessionsService.createSession(anon_id);
  }

  // Student views their sessions
  @UseGuards(JwtAuthGuard)
  @Roles(Role.STUDENT)
  @Get('my')
  getMySessions(@Req() req) {
    return this.sessionsService.getMySessionsByAnon(req.user.anon_id);
  }

  // Counsellor views pending queue
  @UseGuards(JwtAuthGuard)
  @Roles(Role.COUNSELLOR)
  @Get('pending')
  getPending() {
    return this.sessionsService.getPendingSessions();
  }

  // Counsellor accepts a session
  @UseGuards(JwtAuthGuard)
  @Roles(Role.COUNSELLOR)
  @Post(':id/accept')
  acceptSession(@Req() req, @Param('id') id: string) {
    return this.sessionsService.acceptSession(
      Number(id),
      req.user.sub,
    );
  }

  //Counsellor adds note
  @UseGuards(JwtAuthGuard)
@Roles(Role.COUNSELLOR)
@Post(':id/note')
addNote(
  @Req() req,
  @Param('id') id: string,
  @Body('note_text') note_text: string,
) {
  return this.sessionsService.addNote(
    Number(id),
    req.user.sub,
    note_text,
  );
}


  // Counsellor closes a session
  @UseGuards(JwtAuthGuard)
  @Roles(Role.COUNSELLOR)
  @Post(':id/close')
  closeSession(@Param('id') id: string) {
    return this.sessionsService.closeSession(Number(id));
  }
}
