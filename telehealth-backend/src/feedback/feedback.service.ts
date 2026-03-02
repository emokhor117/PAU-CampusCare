import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FeedbackService {
  constructor(private prisma: PrismaService) {}

  async submitFeedback(
    session_id: number,
    user_id: number,
    rating: number,
    comments?: string,
  ) {
    const session = await this.prisma.session.findUnique({
      where: { session_id },
    });

    if (!session) throw new ForbiddenException('Session not found');

    const anon = await this.prisma.anonymousProfile.findUnique({
      where: { user_id },
    });

    if (!anon || session.anon_id !== anon.anon_id) {
      throw new ForbiddenException('Not your session');
    }

    if (session.status !== 'CLOSED') {
      throw new ForbiddenException('Session must be closed before feedback');
    }

    return this.prisma.feedback.create({
      data: {
        session_id,
        rating,
        comments,
      },
    });
  }

  async getSessionFeedback(session_id: number, counsellor_id: number) {
    const session = await this.prisma.session.findUnique({
      where: { session_id },
    });

    if (!session || session.counsellor_id !== counsellor_id) {
      throw new ForbiddenException('Not your session');
    }

    return this.prisma.feedback.findMany({
      where: { session_id },
    });
  }
}