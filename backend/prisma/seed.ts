// backend/prisma/seed.ts
// Ejecutar con: npx ts-node prisma/seed.ts

import { PrismaClient, Rol } from '@prisma/client';
import { hashPassword } from '../src/config/auth';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Sembrando datos iniciales (Planes y Super Admin)...');

  // Limpiar todas las tablas (excepto planes si queremos) para empezar desde cero
  await prisma.pagoVenta.deleteMany({});
  await prisma.detalleVenta.deleteMany({});
  await prisma.venta.deleteMany({});
  await prisma.prenda.deleteMany({});
  await prisma.usuario.deleteMany({});
  await prisma.sucursal.deleteMany({});
  await prisma.empresa.deleteMany({});
  // No borramos planes para que upsert simplemente los actualice

  // ── 1. Planes de Suscripción ──
  const planSemilla = await prisma.planSuscripcion.upsert({
    where: { id: 'plan-semilla' },
    update: {},
    create: {
      id: 'plan-semilla',
      nombre: 'Plan Semilla',
      precioBsMensual: 0,
      limitePrendas: 500,
      limiteSucursal: 1,
      limiteEmpleados: 2,
      accesoWeb: false,
    },
  });

  const planCrecimiento = await prisma.planSuscripcion.upsert({
    where: { id: 'plan-crecimiento' },
    update: {},
    create: {
      id: 'plan-crecimiento',
      nombre: 'Plan Crecimiento',
      precioBsMensual: 100,
      precioBsTrimestral: 270,
      precioBsAnual: 1000,
      limitePrendas: 3000,
      limiteSucursal: 3,
      limiteEmpleados: 10,
      accesoWeb: true,
    },
  });

  const planCorporativo = await prisma.planSuscripcion.upsert({
    where: { id: 'plan-corporativo' },
    update: {},
    create: {
      id: 'plan-corporativo',
      nombre: 'Plan Corporativo',
      precioBsMensual: 250,
      precioBsAnual: 2500,
      limitePrendas: 15000,
      limiteSucursal: 999,
      limiteEmpleados: 999,
      accesoWeb: true,
    },
  });

  console.log('✅ Planes de suscripción creados.');

  // ── 2. Usuario Super Admin ──
  const superAdminEmail = 'admin@sistema.com';
  
  // Buscar si ya existe
  const adminExistente = await prisma.usuario.findFirst({
    where: { correo: superAdminEmail, empresaId: null }
  });

  if (!adminExistente) {
    await prisma.usuario.create({
      data: {
        nombreCompleto: 'Super Administrador',
        ci: 'ADMIN-000',
        correo: superAdminEmail,
        password: hashPassword('admin123'),
        rol: Rol.SUPER_ADMIN,
        debeCambiarPass: false,
        emailVerificado: true,
      }
    });
    console.log('✅ Usuario Super Admin creado (admin@sistema.com / admin123)');
  } else {
    console.log('✅ Usuario Super Admin ya existe.');
  }

  console.log('\n🎉 ¡Base de datos reiniciada desde cero exitosamente!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });