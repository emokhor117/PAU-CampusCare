import { Injectable } from '@nestjs/common';
import { SessionsService } from 'src/sessions/sessions.service';

@Injectable()
export class AssessmentsService {
  private assessments: any[] = [];
  constructor(private sessionsService: SessionsService) {}

  submitAssessment(user_id: number, anon_id: string, dto: any) {
  const score = this.calculateScore(dto.responses);
  const risk_level = this.calculateRiskLevel(score);

  const record = {
    assessment_id: Date.now(),
    user_id,
    assessment_type: dto.assessment_type,
    score,
    risk_level,
    submitted_at: new Date(),
  };

  this.assessments.push(record);

  if (risk_level === 'HIGH') {
    this.sessionsService.createSession(anon_id, true);
  }

  return record;
}


  calculateScore(responses: number[]): number {
    return responses.reduce((a, b) => a + b, 0);
  }

  calculateRiskLevel(score: number): string {
    if (score <= 4) return 'LOW';
    if (score <= 9) return 'MODERATE';
    return 'HIGH';
  }

  getMyAssessments(user_id: number) {
    return this.assessments.filter(a => a.user_id === user_id);
  }
}
