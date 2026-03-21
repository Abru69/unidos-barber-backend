import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma:    PrismaService,
    private jwtSvc:    JwtService,
    private emailSvc:  EmailService,
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (exists) throw new ConflictException('El email ya está registrado');

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: { nombre: dto.nombre, email: dto.email, passwordHash, telefono: dto.telefono },
    });

    const { passwordHash: _, ...safe } = user;
    return { user: safe, token: this.sign(user) };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Credenciales inválidas');

    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Credenciales inválidas');

    const { passwordHash: _, ...safe } = user;
    return { user: safe, token: this.sign(user) };
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return; // No revelar si el email existe

    const token = crypto.randomBytes(32).toString('hex');
    const exp   = new Date(Date.now() + 3600000); // 1 hora

    await this.prisma.user.update({
      where: { id: user.id },
      data:  { resetToken: token, resetTokenExp: exp },
    });

    await this.emailSvc.sendPasswordReset(user.email, user.nombre, token);
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        resetToken:    token,
        resetTokenExp: { gt: new Date() },
      },
    });

    if (!user) throw new UnauthorizedException('Token inválido o expirado');

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await this.prisma.user.update({
      where: { id: user.id },
      data:  { passwordHash, resetToken: null, resetTokenExp: null },
    });
  }

  private sign(user: any) {
    return this.jwtSvc.sign({ sub: user.id, email: user.email, rol: user.rol });
  }
}
