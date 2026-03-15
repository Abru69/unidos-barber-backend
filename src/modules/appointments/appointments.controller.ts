import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, Request, UseGuards, HttpCode,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AppointmentsService } from './appointments.service';

@Controller('appointments')
@UseGuards(JwtAuthGuard)
export class AppointmentsController {
  constructor(private apptSvc: AppointmentsService) {}

  @Post()
  create(@Request() req: any, @Body() body: any) {
    return this.apptSvc.create(req.user.sub, body);
  }

  @Get()
  findAll(@Request() req: any, @Query('status') status?: string) {
    return this.apptSvc.findAll(req.user.sub, req.user.rol, status);
  }

  @Get(':id')
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.apptSvc.findOne(id, req.user.sub, req.user.rol);
  }

  @Put(':id')
  update(@Request() req: any, @Param('id') id: string, @Body() body: any) {
    return this.apptSvc.update(id, req.user.sub, req.user.rol, body);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string) {
    return this.apptSvc.remove(id);
  }
}
