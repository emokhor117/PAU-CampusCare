import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { encrypt, decrypt } from '../common/utils/encryption.util';
import { SenderType } from '@prisma/client';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  async sendMessage(
    session_id: number,
    sender_id: number,
    role: string,
    content: string,
  ) {
    const session = await this.prisma.session.findUnique({
      where: { session_id },
    });

    if (!session) throw new ForbiddenException('Session not found');

    // 🔐 Access control
    if (
      role === 'STUDENT' &&
      session.anon_id !==
        (await this.prisma.anonymousProfile.findUnique({
          where: { user_id: sender_id },
        }))?.anon_id
    ) {
      throw new ForbiddenException('Not your session');
    }

    if (role === 'COUNSELLOR' && session.counsellor_id !== sender_id) {
      throw new ForbiddenException('Not assigned to this session');
    }

    const encrypted = encrypt(content);

    return this.prisma.message.create({
      data: {
        session_id,
        sender_type:
          role === 'STUDENT' ? SenderType.STUDENT : SenderType.COUNSELLOR,
        message_content: encrypted,
      },
    });
  }

  async getMessages(session_id: number, requester_id: number, role: string) {
    const session = await this.prisma.session.findUnique({
      where: { session_id },
    });

    if (!session) throw new ForbiddenException('Session not found');

    // 🔐 Access control (same logic)
    if (
      role === 'STUDENT' &&
      session.anon_id !==
        (await this.prisma.anonymousProfile.findUnique({
          where: { user_id: requester_id },
        }))?.anon_id
    ) {
      throw new ForbiddenException('Not your session');
    }

    if (role === 'COUNSELLOR' && session.counsellor_id !== requester_id) {
      throw new ForbiddenException('Not assigned to this session');
    }

    const messages = await this.prisma.message.findMany({
      where: { session_id },
      orderBy: { sent_at: 'asc' },
    });

    return messages.map((msg) => ({
      ...msg,
      message_content: decrypt(msg.message_content),
    }));
  }
}