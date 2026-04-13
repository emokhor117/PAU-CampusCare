import { Injectable, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';

export interface CreateStudentDto {
  matric_number: string;
  email: string;
  password: string;
  department: string;
  level: string;
}

export interface CreateCounsellorDto {
  staff_number: string;
  email: string;
  password: string;
  department: string;
}

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  // ── Existing Methods ──────────────────────────────────────────────────────

  async findByIdentifier(identifier: string) {
    return this.prisma.user.findUnique({
      where: { identifier },
      include: { anonymousProfile: true },
    });
  }

  async updatePassword(user_id: number, newHash: string) {
    return this.prisma.user.update({
      where: { user_id },
      data: { password_hash: newHash, first_login: false },
    });
  }

  async generateAnonymousProfile(user_id: number) {
    const existing = await this.prisma.anonymousProfile.findUnique({
      where: { user_id },
    });
    if (existing) return existing;

    const alias = 'Student_' + Math.random().toString(36).substring(2, 7);
    return this.prisma.anonymousProfile.create({
      data: { user_id, display_name: alias },
    });
  }

  // ── Admin: Create Student ─────────────────────────────────────────────────

  async createStudent(dto: CreateStudentDto) {
    const existingIdentifier = await this.prisma.user.findUnique({
      where: { identifier: dto.matric_number },
    });
    if (existingIdentifier)
      throw new ConflictException('A student with this matriculation number already exists');

    const existingEmail = await this.prisma.student.findUnique({
      where: { email: dto.email },
    });
    if (existingEmail)
      throw new ConflictException('A student with this email already exists');

    const password_hash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: { identifier: dto.matric_number, password_hash, role: 'STUDENT' },
      });

      await tx.student.create({
        data: {
          user_id: newUser.user_id,
          matric_number: dto.matric_number,
          email: dto.email,
          department: dto.department,
          level: dto.level,
        },
      });

      const alias = 'Student_' + Math.random().toString(36).substring(2, 7);
      await tx.anonymousProfile.create({
        data: { user_id: newUser.user_id, display_name: alias },
      });

      return { user_id: newUser.user_id, alias };
    });

    await this.prisma.logAction(user.user_id, 'Student account created by admin');

    // Send credentials email (non-blocking)
    try{
      await this.emailService.sendStudentCredentials({
      to: dto.email,
      matric_number: dto.matric_number,
      password: dto.password,
      display_name: user.alias,
    });
    }catch(err){
      console.error('Failed to send student credentials email:', err.message);
    }

    return { message: 'Student created successfully', user_id: user.user_id };
  }

  async deleteUser(user_id: number) {
  await this.prisma.$transaction(async (tx) => {
    // 1. Get anon_id for this user (to clean up sessions)
    const profile = await tx.anonymousProfile.findUnique({ where: { user_id } });

    // 2. If student — delete sessions and all related records
    if (profile) {
      const sessions = await tx.session.findMany({
        where: { anon_id: profile.anon_id },
      });
      for (const session of sessions) {
        await tx.feedback.deleteMany({ where: { session_id: session.session_id } });
        await tx.appointment.deleteMany({ where: { session_id: session.session_id } });
        await tx.message.deleteMany({ where: { session_id: session.session_id } });
        await tx.crisisCase.deleteMany({ where: { session_id: session.session_id } });
        await tx.sessionNote.deleteMany({ where: { session_id: session.session_id } });
      }
      await tx.session.deleteMany({ where: { anon_id: profile.anon_id } });
      await tx.anonymousProfile.delete({ where: { user_id } });
    }

    // 3. If counsellor — delete session notes they wrote
    await tx.sessionNote.deleteMany({ where: { counsellor_id: user_id } });

    // 4. Delete shared records
    await tx.assessment.deleteMany({ where: { user_id } });
    await tx.auditLog.deleteMany({ where: { user_id } });
    await tx.resource.deleteMany({ where: { created_by: user_id } });

    // 5. Delete role-specific profile
    await tx.student.deleteMany({ where: { user_id } });
    await tx.staff.deleteMany({ where: { user_id } });

    // 6. Finally delete the user
    await tx.user.delete({ where: { user_id } });
  });

  return { message: 'User deleted successfully' };
}

  // ── Admin: Create Counsellor ──────────────────────────────────────────────

  async createCounsellor(dto: CreateCounsellorDto) {
    const existingIdentifier = await this.prisma.user.findUnique({
      where: { identifier: dto.staff_number },
    });
    if (existingIdentifier)
      throw new ConflictException('A staff member with this staff number already exists');

    const existingEmail = await this.prisma.staff.findUnique({
      where: { email: dto.email },
    });
    if (existingEmail)
      throw new ConflictException('A staff member with this email already exists');

    const password_hash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: { identifier: dto.staff_number, password_hash, role: 'COUNSELLOR' },
      });

      await tx.staff.create({
        data: {
          user_id: newUser.user_id,
          staff_number: dto.staff_number,
          role_type: 'COUNSELLOR',
          department: dto.department,
          email: dto.email,
        },
      });

      return newUser;
    });

    await this.prisma.logAction(user.user_id, 'Counsellor account created by admin');

    // Send credentials email (non-blocking)
    this.emailService.sendCounsellorCredentials({
  to: dto.email,
  staff_number: dto.staff_number,
  password: dto.password,
    }).catch(err => console.error('Failed to send counsellor credentials email:', err));

    return { message: 'Counsellor created successfully', user_id: user.user_id };
  }

  // ── Admin: List Students ──────────────────────────────────────────────────

  async findAllStudents() {
    return this.prisma.student.findMany({
      include: {
        user: {
          select: {
            user_id: true,
            account_status: true,
            created_at: true,
            first_login: true,
            anonymousProfile: { select: { anon_id: true, display_name: true } },
          },
        },
      },
      orderBy: { student_id: 'desc' },
    });
  }

  // ── Admin: List Counsellors ───────────────────────────────────────────────

  async findAllCounsellors() {
    return this.prisma.staff.findMany({
      where: { role_type: 'COUNSELLOR' },
      include: {
        user: {
          select: {
            user_id: true,
            account_status: true,
            created_at: true,
            first_login: true,
          },
        },
      },
      orderBy: { staff_id: 'desc' },
    });
  }

  // ── Admin: Toggle Account Status ──────────────────────────────────────────

  async setAccountStatus(user_id: number, status: 'ACTIVE' | 'SUSPENDED') {
    return this.prisma.user.update({
      where: { user_id },
      data: { account_status: status },
    });
  }
}