import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ServicesModule } from './modules/services/services.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { GalleryModule } from './modules/gallery/gallery.module';
import { BusinessModule } from './modules/business/business.module';
import { EmailModule } from './modules/email/email.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ServeStaticModule.forRoot({
      rootPath:    join(process.cwd(), 'uploads'),
      serveRoot:   '/uploads',
      serveStaticOptions: { index: false },
    }),
    PrismaModule,
    EmailModule,
    AuthModule,
    UsersModule,
    ServicesModule,
    AppointmentsModule,
    GalleryModule,
    BusinessModule,
  ],
})
export class AppModule {}
