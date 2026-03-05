import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CallsService {
  constructor(private prisma: PrismaService) {}

  private get apiKey() {
    return process.env.DAILY_API_KEY;
  }

  async createRoom(session_id: number, requester_id: number, role: string) {
    // Verify session exists and requester has access
    const session = await this.prisma.session.findUnique({
      where: { session_id },
    });
    if (!session) throw new NotFoundException('Session not found');
    if (session.status !== 'ACTIVE')
      throw new ForbiddenException('Session is not active');

    // Access control
    if (role === 'COUNSELLOR' && session.counsellor_id !== requester_id) {
      throw new ForbiddenException('Not your session');
    }
    if (role === 'STUDENT') {
      const anonProfile = await this.prisma.anonymousProfile.findUnique({
        where: { user_id: requester_id },
      });
      if (!anonProfile || anonProfile.anon_id !== session.anon_id) {
        throw new ForbiddenException('Not your session');
      }
    }

    // Create Daily.co room
    const roomName = `campuscare-session-${session_id}`
    const response = await fetch('https://api.daily.co/v1/rooms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        name: roomName,
        properties: {
          enable_chat: false,
          enable_screenshare: false,
          max_participants: 2,
          exp: Math.floor(Date.now() / 1000) + 60 * 60, // expires in 1 hour
        },
      }),
    });

    // Room may already exist — try to fetch it instead
    if (!response.ok) {
      const getResponse = await fetch(`https://api.daily.co/v1/rooms/${roomName}`, {
        headers: { Authorization: `Bearer ${this.apiKey}` },
      });
      if (!getResponse.ok) throw new ForbiddenException('Could not create call room');
      const room = await getResponse.json();
      return { url: room.url, room_name: roomName };
    }

    const room = await response.json();
    return { url: room.url, room_name: roomName };
  }

  async getRoom(session_id: number, requester_id: number, role: string) {
    // Same access control, then just fetch existing room
    const session = await this.prisma.session.findUnique({
      where: { session_id },
    });
    if (!session) throw new NotFoundException('Session not found');

    if (role === 'COUNSELLOR' && session.counsellor_id !== requester_id) {
      throw new ForbiddenException('Not your session');
    }
    if (role === 'STUDENT') {
      const anonProfile = await this.prisma.anonymousProfile.findUnique({
        where: { user_id: requester_id },
      });
      if (!anonProfile || anonProfile.anon_id !== session.anon_id) {
        throw new ForbiddenException('Not your session');
      }
    }

    const roomName = `campuscare-session-${session_id}`
    const response = await fetch(`https://api.daily.co/v1/rooms/${roomName}`, {
      headers: { Authorization: `Bearer ${this.apiKey}` },
    });
    if (!response.ok) throw new NotFoundException('Call room not found — start the call first');
    const room = await response.json();
    return { url: room.url, room_name: roomName };
  }
}