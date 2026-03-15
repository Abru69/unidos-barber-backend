import { Controller, Get, Put, Body, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private prisma: PrismaService) {}

  @Get('me')
  async me(@Request() req: any) {
    const user = await this.prisma.user.findUnique({ where: { id: req.user.sub } });
    const { passwordHash: _, ...safe } = user!;
    return safe;
  }

  @Put('me')
  async update(@Request() req: any, @Body() body: any) {
    const { nombre, telefono, fotoUrl } = body;
    const user = await this.prisma.user.update({
      where: { id: req.user.sub },
      data:  { nombre, telefono, fotoUrl },
    });
    const { passwordHash: _, ...safe } = user;
    return safe;
  }
}
