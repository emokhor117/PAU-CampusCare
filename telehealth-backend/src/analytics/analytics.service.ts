import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getSystemStats() {
    const totalSessions = await this.prisma.session.count();

    const activeSessions = await this.prisma.session.count({
      where: { status: 'ACTIVE' },
    });

    const closedSessions = await this.prisma.session.count({
      where: { status: 'CLOSED' },
    });

    const highRiskCases = await this.prisma.crisisCase.count();

    const averageRating = await this.prisma.feedback.aggregate({
      _avg: { rating: true },
    });

    return {
      totalSessions,
      activeSessions,
      closedSessions,
      highRiskCases,
      averageRating: averageRating._avg.rating || 0,
    };
  }

  async getAppointmentsByType() {
    return this.prisma.appointment.groupBy({
      by: ['appointment_type'],
      _count: true,
    });
  }

  async getCounsellorWorkload() {
    return this.prisma.session.groupBy({
      by: ['counsellor_id'],
      _count: true,
    });
  }
}