import { Controller, Post, Get, Param, Req, UseGuards } from '@nestjs/common';
import { CallsService } from './calls.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/utils/roles.enum';

@Controller('calls')
@UseGuards(JwtAuthGuard)
export class CallsController {
  constructor(private callsService: CallsService) {}

  // Either party creates/gets the room
  @Post(':sessionId/create')
  @Roles(Role.STUDENT, Role.COUNSELLOR)
  createRoom(@Param('sessionId') sessionId: string, @Req() req) {
    return this.callsService.createRoom(
      Number(sessionId),
      req.user.sub,
      req.user.role,
    );
  }

  // Either party fetches an existing room
  @Get(':sessionId')
  @Roles(Role.STUDENT, Role.COUNSELLOR)
  getRoom(@Param('sessionId') sessionId: string, @Req() req) {
    return this.callsService.getRoom(
      Number(sessionId),
      req.user.sub,
      req.user.role,
    );
  }
}