import { Controller, Post, Body, UseGuards, Req, Get } from '@nestjs/common';
import { AssessmentsService } from './assessments.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/utils/roles.enum';
import { CreateAssessmentDto } from './dto/create-assessment.dto';

@Controller('assessments')
export class AssessmentsController {
  constructor(private assessmentsService: AssessmentsService) {}

  @UseGuards(JwtAuthGuard)
  @Roles(Role.STUDENT)
  @Post()
  submit(@Req() req, @Body() dto: CreateAssessmentDto) {
  return this.assessmentsService.submitAssessment(
    req.user.sub,
    req.user.anon_id,
    dto,
  );
}

  @UseGuards(JwtAuthGuard)
  @Roles(Role.STUDENT)
  @Get('my')
  getMine(@Req() req) {
    return this.assessmentsService.getMyAssessments(req.user.sub);
  }
}
