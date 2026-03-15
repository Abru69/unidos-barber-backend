import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AppointmentsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, body: any) {
    const service = await this.prisma.service.findUnique({ where: { id: body.serviceId } });
    if (!service || !service.activo) throw new BadRequestException('Servicio no disponible');

    const start = new Date(body.startDatetime);
    const end   = new Date(start.getTime() + service.duracionMin * 60000);

    const conflict = await this.prisma.appointment.findFirst({
      where: {
        estado: { in: ['PENDIENTE', 'CONFIRMADA'] },
        startDatetime: { lt: end },
        endDatetime:   { gt: start },
      },
    });
    if (conflict) throw new BadRequestException('El horario ya está ocupado');

    return this.prisma.appointment.create({
      data: {
        userId,
        serviceId:     body.serviceId,
        startDatetime: start,
        endDatetime:   end,
        notas:         body.notas,
      },
      include: {
        service: true,
        user: { select: { id: true, nombre: true, email: true, telefono: true } },
      },
    });
  }

  async findAll(userId: string, rol: string, status?: string) {
    const where: any = {};
    if (status) where.estado = status;
    if (rol === 'CLIENTE') where.userId = userId;

    return this.prisma.appointment.findMany({
      where,
      include: {
        service: true,
        user: { select: { id: true, nombre: true, email: true, telefono: true } },
      },
      orderBy: { startDatetime: 'asc' },
    });
  }

  async findOne(id: string, userId: string, rol: string) {
    const appt = await this.prisma.appointment.findUnique({
      where: { id },
      include: {
        service: true,
        user: { select: { id: true, nombre: true, email: true, telefono: true } },
      },
    });
    if (!appt) throw new NotFoundException('Cita no encontrada');
    if (rol === 'CLIENTE' && appt.userId !== userId) throw new ForbiddenException();
    return appt;
  }

  async update(id: string, userId: string, rol: string, body: any) {
    const appt = await this.findOne(id, userId, rol);

    if (rol === 'CLIENTE' && body.estado && body.estado !== 'CANCELADA') {
      throw new ForbiddenException('Solo puedes cancelar tu cita');
    }

    let data: any = {};
    if (body.estado) data.estado = body.estado;

    if (body.startDatetime) {
      const service = await this.prisma.service.findUnique({ where: { id: appt.serviceId } });
      const start = new Date(body.startDatetime);
      const end   = new Date(start.getTime() + service!.duracionMin * 60000);
      data = { ...data, startDatetime: start, endDatetime: end };
    }

    return this.prisma.appointment.update({
      where: { id },
      data,
      include: { service: true },
    });
  }

  remove(id: string) {
    return this.prisma.appointment.delete({ where: { id } });
  }
}
