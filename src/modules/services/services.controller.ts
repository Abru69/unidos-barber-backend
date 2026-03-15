import {
  Controller, Get, Post, Put, Delete,
  Body, Param, UseGuards, HttpCode,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('services')
export class ServicesController {
  constructor(private prisma: PrismaService) {}

  @Get()
  findAll() {
    return this.prisma.service.findMany({ where: { activo: true }, orderBy: { createdAt: 'asc' } });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.prisma.service.findUnique({ where: { id } });
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('BARBERO')
  create(@Body() body: any) {
    return this.prisma.service.create({ data: body });
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('BARBERO')
  update(@Param('id') id: string, @Body() body: any) {
    return this.prisma.service.update({ where: { id }, data: body });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('BARBERO')
  @HttpCode(204)
  remove(@Param('id') id: string) {
    return this.prisma.service.delete({ where: { id } });
  }
}
