import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/utils/roles.enum';
import { AppointmentType, AppointmentStatus } from '@prisma/client';

@Controller('appointments')
@UseGuards(JwtAuthGuard)
export class AppointmentsController {
  constructor(private appointmentsService: AppointmentsService) {}

  /**
   * Student requests appointment
   */
  @Post(':session_id')
  @Roles(Role.STUDENT)
  requestAppointment(
    @Param('session_id') session_id: string,
    @Body('type') type: AppointmentType,
    @Body('scheduled_time') scheduled_time: string,
    @Req() req,
  ) {
    return this.appointmentsService.requestAppointment(
      Number(session_id),
      req.user.sub,
      type,
      new Date(scheduled_time),
    );
  }

  /**
   * Counsellor views their appointments
   */
  @Get('counsellor')
  @Roles(Role.COUNSELLOR)
  getCounsellorAppointments(@Req() req) {
    return this.appointmentsService.getCounsellorAppointments(req.user.sub);
  }

  /**
   * Student views their appointments
   */
  @Get('student')
  @Roles(Role.STUDENT)
  getStudentAppointments(@Req() req) {
    return this.appointmentsService.getStudentAppointments(req.user.sub);
  }

  /**
   * Counsellor updates status
   */
  @Patch(':id/status')
  @Roles(Role.COUNSELLOR)
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: AppointmentStatus,
    @Req() req,
  ) {
    return this.appointmentsService.updateStatus(
      Number(id),
      req.user.sub,
      status,
    );
  }
}