// backend/prisma/seed.ts
// Ejecutar con: npx ts-node prisma/seed.ts

import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

// Mismo hash que usa auth.ts
const SALT = 'boutique-salt-2025';
function hashPassword(plain: string): string {
  return crypto.createHmac('sha256', SALT).update(plain).digest('hex');
}

async function main() {
  console.log('🌱 Sembrando datos iniciales...');

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

  console.log('✅ Planes creados:', planSemilla.nombre, planCrecimiento.nombre, planCorporativo.nombre);

  // ── 2. Empresa demo ──
  const empresa = await prisma.empresa.upsert({
    where: { id: 'empresa-demo' },
    update: {},
    create: {
      id: 'empresa-demo',
      nombre: 'Boutique Elegance',
      planId: planSemilla.id,
    },
  });
  console.log('✅ Empresa:', empresa.nombre);

  // ── 3. Sucursal por defecto ──
  const sucursal1 = await prisma.sucursal.upsert({
    where: { id: 'suc-1' },
    update: {},
    create: {
      id: 'suc-1',
      nombre: 'Casa Matriz - Boutique Elegance',
      direccion: 'Av. Principal #123, Cochabamba',
      detalles: 'Sucursal principal',
      horarios: '08:00 - 20:00',
      maxAdministradores: 3,
      estado: 'ACTIVO',
      empresaId: empresa.id,
    },
  });

  const sucursal2 = await prisma.sucursal.upsert({
    where: { id: 'suc-2' },
    update: {},
    create: {
      id: 'suc-2',
      nombre: 'Sucursal Centro',
      direccion: 'Mall Central Local 45, Cochabamba',
      detalles: 'Sucursal centro comercial',
      horarios: '09:00 - 21:00',
      maxAdministradores: 2,
      estado: 'ACTIVO',
      empresaId: empresa.id,
    },
  });
  console.log('✅ Sucursales:', sucursal1.nombre, '|', sucursal2.nombre);

  // ── 4. Usuarios ──
  const owner = await prisma.usuario.upsert({
    where: { ci: '12345678' },
    update: {},
    create: {
      nombreCompleto: 'Carlos Mendoza',
      ci: '12345678',
      correo: 'carlos@email.com',
      telefono: '70012345',
      edad: 32,
      password: hashPassword('admin123'), // Para pruebas
      debeCambiarPass: false,
      rol: 'OWNER_PRINCIPAL',
      estado: 'ACTIVO',
      empresaId: empresa.id,
      // Owner no tiene sucursal asignada — ve todas
    },
  });

  const admin = await prisma.usuario.upsert({
    where: { ci: '23456789' },
    update: {},
    create: {
      nombreCompleto: 'Ana García',
      ci: '23456789',
      correo: 'ana@email.com',
      telefono: '70023456',
      edad: 28,
      password: hashPassword('23456789'), // CI como contraseña inicial
      debeCambiarPass: true,
      rol: 'ADMINISTRADOR',
      estado: 'ACTIVO',
      empresaId: empresa.id,
      sucursalId: sucursal1.id,
    },
  });

  const empleado = await prisma.usuario.upsert({
    where: { ci: '34567890' },
    update: {},
    create: {
      nombreCompleto: 'Luis Torres',
      ci: '34567890',
      correo: 'luis@email.com',
      telefono: '70034567',
      edad: 22,
      password: hashPassword('34567890'), // CI como contraseña inicial
      debeCambiarPass: true,
      rol: 'EMPLEADO',
      estado: 'ACTIVO',
      permisoEditarPrendas: true,
      empresaId: empresa.id,
      sucursalId: sucursal1.id,
    },
  });
  console.log('✅ Usuarios:', owner.nombreCompleto, '|', admin.nombreCompleto, '|', empleado.nombreCompleto);

  // ── 5. Prendas demo ──
  const prendasData = [
    { codigo: '7501234567890', tipoCodigo: 'BARRAS' as const, marca: 'Bershka', tipo: 'Blusa', detalles: 'Blusa floral manga corta', estado: 'NUEVO' as const, precio: 150, sucursalId: sucursal1.id },
    { codigo: 'QR-ZARA-001', tipoCodigo: 'QR' as const, marca: 'Zara', tipo: 'Pantalón', detalles: 'Pantalón slim fit negro', estado: 'NUEVO' as const, precio: 280, rebaja: 250, publicadoWeb: true, sucursalId: sucursal1.id },
    { codigo: 'MAN-HM-055', tipoCodigo: 'MANUAL' as const, marca: 'H&M', tipo: 'Vestido', detalles: 'Vestido casual verano', estado: 'SEMI_NUEVO' as const, precio: 200, sucursalId: sucursal2.id },
    { codigo: '8901234567890', tipoCodigo: 'BARRAS' as const, marca: 'Pull&Bear', tipo: 'Short', detalles: 'Short denim clásico', estado: 'NUEVO' as const, precio: 120, publicadoWeb: true, sucursalId: sucursal1.id },
    { codigo: 'QR-MNG-012', tipoCodigo: 'QR' as const, marca: 'Mango', tipo: 'Falda', detalles: 'Falda plisada midi', estado: 'NUEVO' as const, precio: 180, sucursalId: sucursal2.id },
  ];

  for (const p of prendasData) {
    await prisma.prenda.upsert({
      where: { codigo: p.codigo },
      update: {},
      create: { ...p, empresaId: empresa.id },
    });
  }
  console.log('✅ 5 prendas demo creadas');

  console.log('\n🎉 ¡Seed completado exitosamente!');
  console.log('\n📋 Credenciales de prueba:');
  console.log('  Owner:    carlos@email.com / admin123');
  console.log('  Admin:    ana@email.com / 23456789 (pedirá cambio)');
  console.log('  Empleado: luis@email.com / 34567890 (pedirá cambio)');
}

main()
  .catch((e) => { console.error('❌ Error en seed:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });