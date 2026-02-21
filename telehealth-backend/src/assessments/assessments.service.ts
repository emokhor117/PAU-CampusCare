import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RiskLevel } from '@prisma/client';
import { SessionsService } from '../sessions/sessions.service';

@Injectable()
export class AssessmentsService {
  constructor(
    private prisma: PrismaService,
    private sessionsService: SessionsService,
  ) {}

  calculateScore(responses: number[]): number {
    return responses.reduce((a, b) => a + b, 0);
  }

  calculateRiskLevel(score: number): RiskLevel {
    if (score <= 4) return RiskLevel.LOW;
    if (score <= 9) return RiskLevel.MODERATE;
    return RiskLevel.HIGH;
  }

  async submitAssessment(
    user_id: number,
    anon_id: string,
    dto: any,
  ) {
    const score = this.calculateScore(dto.responses);
    const risk_level = this.calculateRiskLevel(score);

    const record = await this.prisma.assessment.create({
      data: {
        user_id,
        assessment_type: dto.assessment_type,
        score,
        risk_level,
      },
    });

    // Auto-create priority session if HIGH risk
    if (risk_level === RiskLevel.HIGH) {
      await this.sessionsService.createSession(anon_id, true);
    }

    return record;
  }

  async getMyAssessments(user_id: number) {
    return this.prisma.assessment.findMany({
      where: { user_id },
      orderBy: { submitted_at: 'desc' },
    });
  }
}
