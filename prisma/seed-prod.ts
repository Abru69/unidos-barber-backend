import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } },
});

async function main() {
  console.log('🌱 Iniciando seed...');

  const adminHash = await bcrypt.hash('Password123!', 12);
  const admin = await prisma.user.upsert({
    where:  { email: 'admin@unidos.com' },
    update: {},
    create: { nombre: 'Admin Unidos', email: 'admin@unidos.com', passwordHash: adminHash, rol: 'BARBERO' },
  });
  console.log('✅ Admin:', admin.email);

  const clientHash = await bcrypt.hash('Password123!', 12);
  await prisma.user.upsert({
    where:  { email: 'cliente@test.com' },
    update: {},
    create: { nombre: 'Juan Cliente', email: 'cliente@test.com', passwordHash: clientHash, rol: 'CLIENTE' },
  });
  console.log('✅ Cliente creado');

  const servicios = [
    { nombre: 'Corte Clásico',  descripcion: 'Corte tradicional con tijera y máquina',   precio: 150, duracionMin: 30 },
    { nombre: 'Degradado',       descripcion: 'Fade profesional con degradado perfecto',   precio: 180, duracionMin: 45 },
    { nombre: 'Barba',           descripcion: 'Perfilado y arreglo de barba completo',     precio: 120, duracionMin: 30 },
    { nombre: 'Corte + Barba',  descripcion: 'Combo completo: corte y arreglo de barba',  precio: 250, duracionMin: 60 },
  ];
  for (const s of servicios) {
    await prisma.service.create({ data: s }).catch(() => {});
  }
  console.log('✅ Servicios:', servicios.length);

  for (let i = 1; i <= 6; i++) {
    await prisma.businessHours.create({
      data: { diaSemana: i, startTime: '09:00', endTime: i === 6 ? '17:00' : '19:00', intervaloMin: 30, activo: true },
    }).catch(() => {});
  }
  console.log('✅ Horarios creados');

  console.log('🎉 Seed completado');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
