import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AppointmentType, AppointmentStatus } from '@prisma/client';

@Injectable()
export class AppointmentsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Student requests an appointment
   */
  async requestAppointment(
    session_id: number,
    user_id: number,
    type: AppointmentType,
    scheduled_time: Date,
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

    return this.prisma.appointment.create({
      data: {
        session_id,
        appointment_type: type,
        scheduled_time,
      },
    });
  }

  /**
   * Counsellor views their appointments
   */
  async getCounsellorAppointments(counsellor_id: number) {
    return this.prisma.appointment.findMany({
      where: {
        session: {
          counsellor_id,
        },
      },
      include: {
        session: true,
      },
      orderBy: {
        scheduled_time: 'asc',
      },
    });
  }

  /**
   * Counsellor updates status
   */
  async updateStatus(
    appointment_id: number,
    counsellor_id: number,
    status: AppointmentStatus,
  ) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { appointment_id },
      include: { session: true },
    });

    if (!appointment) throw new ForbiddenException('Appointment not found');

    if (appointment.session.counsellor_id !== counsellor_id) {
      throw new ForbiddenException('Not your appointment');
    }

    return this.prisma.appointment.update({
      where: { appointment_id },
      data: { status },
    });
  }

  /**
   * Student views their appointments
   */
  async getStudentAppointments(user_id: number) {
    const anon = await this.prisma.anonymousProfile.findUnique({
      where: { user_id },
    });

    return this.prisma.appointment.findMany({
      where: {
        session: {
          anon_id: anon?.anon_id,
        },
      },
      orderBy: {
        scheduled_time: 'asc',
      },
    });
  }
}