import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SessionStatus } from '@prisma/client';

@Injectable()
export class SessionsService {
  constructor(private prisma: PrismaService) {}

  async createSession(anon_id: string, is_priority = false) {
    return this.prisma.session.create({
      data: {
        anon_id,
        is_priority,
      },
    });
  }

  async getMySessionsByAnon(anon_id: string) {
    return this.prisma.session.findMany({
      where: { anon_id },
      orderBy: { started_at: 'desc' },
    });
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

  async acceptSession(session_id: number, counsellor_id: number) {
  const session = await this.prisma.session.update({
    where: { session_id },
    data: {
      counsellor_id,
      status: 'ACTIVE',
    },
  });

  
  await this.prisma.logAction(
    counsellor_id,
    `Accepted session ${session_id}`,
  );

  return session;
}

  async addNote(
  session_id: number,
  counsellor_id: number,
  note_text: string,
) {
  return this.prisma.sessionNote.create({
    data: {
      session_id,
      counsellor_id,
      note_text,
    },
  });
}

async flagCrisis(
  session_id: number,
  risk_reason: string,
  action_taken: string,
) {
  // 1️⃣ Fetch session to get counsellor_id for audit log
  const session = await this.prisma.session.findUnique({
    where: { session_id },
  });

  if (!session) {
    throw new Error('Session not found');
  }

  // 2️⃣ Update session status → ESCALATED
  await this.prisma.session.update({
    where: { session_id },
    data: {
      status: 'ESCALATED',
    },
  });

  // 3️⃣ Create crisis case record
  const crisis = await this.prisma.crisisCase.create({
    data: {
      session_id,
      risk_reason,
      action_taken,
    },
  });

  // 4️⃣ Write audit log (only if counsellor exists)
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
    data: {
      status: 'CLOSED',
      ended_at: new Date(),
    },
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
