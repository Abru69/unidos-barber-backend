import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('business')
export class BusinessController {
  constructor(private prisma: PrismaService) {}

  @Get('hours')
  getHours() {
    return this.prisma.businessHours.findMany({ orderBy: { diaSemana: 'asc' } });
  }

  @Put('hours')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('BARBERO')
  async updateHours(@Body() body: any[]) {
    await this.prisma.businessHours.deleteMany();
    return this.prisma.businessHours.createMany({ data: body });
  }
}
