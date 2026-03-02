import { Controller, Post, Get, Param, Body, Req, UseGuards } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/utils/roles.enum';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  @Post(':session_id')
  @Roles(Role.STUDENT, Role.COUNSELLOR)
  sendMessage(
    @Param('session_id') session_id: string,
    @Body('content') content: string,
    @Req() req,
  ) {
    return this.messagesService.sendMessage(
      Number(session_id),
      req.user.sub,
      req.user.role,
      content,
    );
  }

  @Get(':session_id')
  @Roles(Role.STUDENT, Role.COUNSELLOR)
  getMessages(@Param('session_id') session_id: string, @Req() req) {
    return this.messagesService.getMessages(
      Number(session_id),
      req.user.sub,
      req.user.role,
    );
  }
}