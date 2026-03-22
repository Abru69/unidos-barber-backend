import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class BusinessService {
  constructor(private prisma: PrismaService) {}

  getHours() {
    return this.prisma.businessHours.findMany({
      orderBy: { diaSemana: 'asc' },
    });
  }

  async updateHours(dias: any[]) {
    for (const dia of dias) {
      await this.prisma.businessHours.updateMany({
        where: { diaSemana: dia.diaSemana },
        data: {
          startTime:    dia.startTime,
          endTime:      dia.endTime,
          intervaloMin: dia.intervaloMin,
          activo:       dia.activo,
        },
      });
    }
    return this.getHours();
  }
}
