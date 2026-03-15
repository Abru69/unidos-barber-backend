import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcryptjs';

async function main() {
  const { Pool } = require('@prisma/adapter-pg/node_modules/pg');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool as any);
  const prisma = new PrismaClient({ adapter } as any);

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
  console.log('✅ Cliente de prueba creado');

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
      data: { diaSemana: i, startTime: i === 6 ? '09:00' : '09:00', endTime: i === 6 ? '17:00' : '19:00', intervaloMin: 30, activo: true },
    }).catch(() => {});
  }
  console.log('✅ Horarios creados');

  console.log('🎉 Seed completado');
  await prisma.$disconnect();
  await pool.end();
}

main().catch(e => { console.error(e); process.exit(1); });
