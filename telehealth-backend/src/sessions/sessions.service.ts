import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SessionStatus } from '@prisma/client';
import { EmailService } from '../email/email.service';

@Injectable()
export class SessionsService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  async createSession(anon_id: string, is_priority = false) {
    // Create the session
    const session = await this.prisma.session.create({
      data: { anon_id, is_priority },
    });

    // Pick a random active counsellor and notify them by email
    try {
      const counsellors = await this.prisma.staff.findMany({
        where: { role_type: 'COUNSELLOR' },
        include: {
          user: { select: { account_status: true } },
        },
      });

      const activeCounsellors = counsellors.filter(
        c => c.user.account_status === 'ACTIVE',
      );

      if (activeCounsellors.length > 0) {
        const random = activeCounsellors[
          Math.floor(Math.random() * activeCounsellors.length)
        ];

        await this.emailService.sendSessionNotification({
          to: random.email,
          session_id: session.session_id,
          is_priority,
        });
      }
    } catch (err) {
      // Email failure should never block session creation
      console.error('Failed to send session notification email:', err);
    }

    return session;
  }

  async getMySessionsByAnon(anon_id: string) {
    return this.prisma.session.findMany({
      where: { anon_id },
      orderBy: { started_at: 'desc' },
    });
  }

  async updateSessionType(session_id: number, session_type: string) {
    return this.prisma.session.update({
      where: { session_id },
      data: { session_type: session_type as any },
    });
  }

  async getSessionById(session_id: number, counsellor_id: number) {
    const session = await this.prisma.session.findUnique({
      where: { session_id },
    });

    if (!session) throw new ForbiddenException('Session not found');
    if (session.counsellor_id !== counsellor_id)
      throw new ForbiddenException('Not your session');
    return session;
  }

  async getPendingSessions() {
    return this.prisma.session.findMany({
      where: { status: SessionStatus.PENDING },
      orderBy: [
        { is_priority: 'desc' },
        { started_at: 'asc' },
      ],
    });
  }

  async getMyCounsellorSessions(counsellor_id: number) {
    return this.prisma.session.findMany({
      where: { counsellor_id },
      orderBy: { started_at: 'desc' },
    });
  }

  async acceptSession(session_id: number, counsellor_id: number) {
    const session = await this.prisma.session.update({
      where: { session_id },
      data: { counsellor_id, status: 'ACTIVE' },
    });

    await this.prisma.logAction(counsellor_id, `Accepted session ${session_id}`);
    return session;
  }

  async addNote(session_id: number, counsellor_id: number, note_text: string) {
    return this.prisma.sessionNote.create({
      data: { session_id, counsellor_id, note_text },
    });
  }

  async getSessionNotes(session_id: number, counsellor_id: number) {
  // verify this counsellor owns the session
  const session = await this.prisma.session.findUnique({ where: { session_id } });
  if (!session) throw new ForbiddenException('Session not found');
  if (session.counsellor_id !== counsellor_id) throw new ForbiddenException('Not your session');

  return this.prisma.sessionNote.findMany({
    where: { session_id },
    orderBy: { created_at: 'asc' },
  });
}

  async flagCrisis(session_id: number, risk_reason: string, action_taken: string) {
    const session = await this.prisma.session.findUnique({ where: { session_id } });
    if (!session) throw new Error('Session not found');

    await this.prisma.session.update({
      where: { session_id },
      data: { status: 'ESCALATED' },
    });

    const crisis = await this.prisma.crisisCase.create({
      data: { session_id, risk_reason, action_taken },
    });

    if (session.counsellor_id) {
      await this.prisma.logAction(
        session.counsellor_id,
        `Flagged crisis for session ${session_id}`,
      );
    }

    return crisis;
  }

  async closeSession(session_id: number) {
    const session = await this.prisma.session.update({
      where: { session_id },
      data: { status: 'CLOSED', ended_at: new Date() },
    });

    if (session.counsellor_id) {
      await this.prisma.logAction(
        session.counsellor_id,
        `Closed session ${session_id}`,
      );
    }

    return session;
  }
}