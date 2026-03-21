import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private resend = new Resend(process.env.RESEND_API_KEY);

  async sendPasswordReset(email: string, nombre: string, token: string) {
    const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password?token=${token}`;

    await this.resend.emails.send({
      from: 'Unidos Barber <onboarding@resend.dev>',
      to: email,
      subject: 'Recupera tu contraseña — Unidos Barber Shop',
      html: `
        <div style="font-family: Georgia, serif; max-width: 520px; margin: 0 auto; background: #0f0f0f; color: #f0ede6; padding: 40px; border-radius: 8px;">
          <h1 style="color: #c9a84c; font-size: 28px; margin-bottom: 8px;">✂ Unidos Barber</h1>
          <h2 style="font-size: 20px; margin-bottom: 16px;">Hola ${nombre},</h2>
          <p style="color: #7a7670; line-height: 1.6; margin-bottom: 24px;">
            Recibimos una solicitud para restablecer la contraseña de tu cuenta.
            Si no fuiste tú, puedes ignorar este correo.
          </p>
          <a href="${resetUrl}"
             style="display: inline-block; background: #c9a84c; color: #0f0f0f; padding: 14px 32px; border-radius: 4px; text-decoration: none; font-weight: bold; font-size: 16px; margin-bottom: 24px;">
            Restablecer contraseña
          </a>
          <p style="color: #7a7670; font-size: 14px; margin-top: 24px;">
            Este enlace expira en <strong style="color: #f0ede6;">1 hora</strong>.
          </p>
          <hr style="border: none; border-top: 1px solid #2e2e2e; margin: 24px 0;" />
          <p style="color: #7a7670; font-size: 12px;">
            © ${new Date().getFullYear()} Unidos Barber Shop — Morelia, Michoacán
          </p>
        </div>
      `,
    });
  }
}
