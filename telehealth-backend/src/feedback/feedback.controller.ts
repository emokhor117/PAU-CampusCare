import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/utils/roles.enum';

@Controller('feedback')
@UseGuards(JwtAuthGuard)
export class FeedbackController {
  constructor(private feedbackService: FeedbackService) {}

  /**
   * Student submits feedback
   */
  @Post(':session_id')
  @Roles(Role.STUDENT)
  submitFeedback(
    @Param('session_id') session_id: string,
    @Body('rating') rating: number,
    @Body('comments') comments: string,
    @Req() req,
  ) {
    return this.feedbackService.submitFeedback(
      Number(session_id),
      req.user.sub,
      rating,
      comments,
    );
  }

  /**
   * Counsellor views feedback for their session
   */
  @Get(':session_id')
  @Roles(Role.COUNSELLOR)
  getSessionFeedback(@Param('session_id') session_id: string, @Req() req) {
    return this.feedbackService.getSessionFeedback(
      Number(session_id),
      req.user.sub,
    );
  }
}