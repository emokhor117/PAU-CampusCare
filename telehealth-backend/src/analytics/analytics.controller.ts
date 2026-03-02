import { Controller, Get, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/utils/roles.enum';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
@Roles(Role.ADMIN)
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('system')
  getSystemStats() {
    return this.analyticsService.getSystemStats();
  }

  @Get('appointments')
  getAppointmentsByType() {
    return this.analyticsService.getAppointmentsByType();
  }

  @Get('workload')
  getCounsellorWorkload() {
    return this.analyticsService.getCounsellorWorkload();
  }
}