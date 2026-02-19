import { Injectable } from '@nestjs/common';

@Injectable()
export class SessionsService {
  private sessions: any[] = [];

  createSession(anon_id: string, priority = false) {
  const session = {
    session_id: Date.now(),
    anon_id,
    counsellor_id: null,
    session_type: 'TEXT',
    status: 'PENDING',
    priority,
    started_at: new Date(),
    ended_at: null,
  };

  this.sessions.push(session);
  return session;
} 

private notes: any[] = [];

addNote(session_id: number, counsellor_id: number, note_text: string) {
  const note = {
    note_id: Date.now(),
    session_id,
    counsellor_id,
    note_text,
    created_at: new Date(),
  };

  this.notes.push(note);
  return note;
}

  getPendingSessions() {
  return this.sessions
    .filter(s => s.status === 'PENDING')
    .sort((a, b) => Number(b.priority) - Number(a.priority));
}


  acceptSession(session_id: number, counsellor_id: number) {
    const session = this.sessions.find(s => s.session_id === session_id);
    if (!session) return null;

    session.status = 'ACTIVE';
    session.counsellor_id = counsellor_id;
    return session;
  }

  closeSession(session_id: number) {
    const session = this.sessions.find(s => s.session_id === session_id);
    if (!session) return null;

    session.status = 'CLOSED';
    session.ended_at = new Date();
    return session;
  }

  getMySessionsByAnon(anon_id: string) {
    return this.sessions.filter(s => s.anon_id === anon_id);
  }

  getMySessionsByCounsellor(counsellor_id: number) {
    return this.sessions.filter(s => s.counsellor_id === counsellor_id);
  }
}

