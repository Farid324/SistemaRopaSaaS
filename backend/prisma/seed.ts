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

  // ══════════════════════════════════════════════════════
  // ── 2. EMPRESA 1: Boutique Elegance — Carlos Mendoza ──
  // ══════════════════════════════════════════════════════

  const empresa1 = await prisma.empresa.upsert({
    where: { id: 'empresa-demo' },
    update: {},
    create: {
      id: 'empresa-demo',
      nombre: 'Boutique Elegance',
      planId: planCrecimiento.id,
    },
  });

  const suc1a = await prisma.sucursal.upsert({
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
      empresaId: empresa1.id,
    },
  });

  const suc1b = await prisma.sucursal.upsert({
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
      empresaId: empresa1.id,
    },
  });

  const owner1 = await prisma.usuario.upsert({
    where: { ci_empresaId: { ci: '12345678', empresaId: empresa1.id } },
    update: {},
    create: {
      nombreCompleto: 'Carlos Mendoza',
      ci: '12345678',
      correo: 'carlos@email.com',
      telefono: '70012345',
      edad: 32,
      password: hashPassword('admin123'),
      debeCambiarPass: false,
      rol: 'OWNER_PRINCIPAL',
      estado: 'ACTIVO',
      empresaId: empresa1.id,
    },
  });

  const admin1 = await prisma.usuario.upsert({
    where: { ci_empresaId: { ci: '23456789', empresaId: empresa1.id } },
    update: {},
    create: {
      nombreCompleto: 'Ana García',
      ci: '23456789',
      correo: 'ana@email.com',
      telefono: '70023456',
      edad: 28,
      password: hashPassword('23456789'),
      debeCambiarPass: true,
      rol: 'ADMINISTRADOR',
      estado: 'ACTIVO',
      empresaId: empresa1.id,
      sucursalId: suc1a.id,
    },
  });

  const empleado1 = await prisma.usuario.upsert({
    where: { ci_empresaId: { ci: '34567890', empresaId: empresa1.id } },
    update: {},
    create: {
      nombreCompleto: 'Luis Torres',
      ci: '34567890',
      correo: 'luis@email.com',
      telefono: '70034567',
      edad: 22,
      password: hashPassword('34567890'),
      debeCambiarPass: true,
      rol: 'EMPLEADO',
      estado: 'ACTIVO',
      permisoEditarPrendas: true,
      empresaId: empresa1.id,
      sucursalId: suc1a.id,
    },
  });

  console.log('✅ Empresa 1:', empresa1.nombre);
  console.log('   Owner:', owner1.nombreCompleto, '| Admin:', admin1.nombreCompleto, '| Empleado:', empleado1.nombreCompleto);

  // ══════════════════════════════════════════════════════
  // ── 3. EMPRESA 2: ClickModa Store — María Fernández ──
  // ══════════════════════════════════════════════════════

  const empresa2 = await prisma.empresa.upsert({
    where: { id: 'empresa-clickmoda' },
    update: {},
    create: {
      id: 'empresa-clickmoda',
      nombre: 'ClickModa Store',
      planId: planCrecimiento.id,
    },
  });

  const suc2a = await prisma.sucursal.upsert({
    where: { id: 'suc-clickmoda-1' },
    update: {},
    create: {
      id: 'suc-clickmoda-1',
      nombre: 'ClickModa - Sede Principal',
      direccion: 'Calle Bolívar #456, Santa Cruz',
      detalles: 'Tienda principal de ClickModa',
      horarios: '09:00 - 21:00',
      maxAdministradores: 2,
      estado: 'ACTIVO',
      empresaId: empresa2.id,
    },
  });

  const owner2 = await prisma.usuario.upsert({
    where: { ci_empresaId: { ci: '44556677', empresaId: empresa2.id } },
    update: {},
    create: {
      nombreCompleto: 'María Fernández',
      ci: '44556677',
      correo: 'maria@email.com',
      telefono: '71144556',
      edad: 29,
      password: hashPassword('admin123'),
      debeCambiarPass: false,
      rol: 'OWNER_PRINCIPAL',
      estado: 'ACTIVO',
      empresaId: empresa2.id,
    },
  });

  const empleado2 = await prisma.usuario.upsert({
    where: { ci_empresaId: { ci: '55667788', empresaId: empresa2.id } },
    update: {},
    create: {
      nombreCompleto: 'Diego Salazar',
      ci: '55667788',
      correo: 'diego@email.com',
      telefono: '71155667',
      edad: 24,
      password: hashPassword('55667788'),
      debeCambiarPass: true,
      rol: 'EMPLEADO',
      estado: 'ACTIVO',
      permisoEditarPrendas: false,
      empresaId: empresa2.id,
      sucursalId: suc2a.id,
    },
  });

  console.log('✅ Empresa 2:', empresa2.nombre);
  console.log('   Owner:', owner2.nombreCompleto, '| Empleado:', empleado2.nombreCompleto);

  // ══════════════════════════════════════════════════════
  // ── 4. EMPRESA 3: Urban Style Bolivia — Roberto Chávez ──
  // ══════════════════════════════════════════════════════

  const empresa3 = await prisma.empresa.upsert({
    where: { id: 'empresa-urbanstyle' },
    update: {},
    create: {
      id: 'empresa-urbanstyle',
      nombre: 'Urban Style Bolivia',
      planId: planSemilla.id,
    },
  });

  const suc3a = await prisma.sucursal.upsert({
    where: { id: 'suc-urban-1' },
    update: {},
    create: {
      id: 'suc-urban-1',
      nombre: 'Urban Style - Megacenter',
      direccion: 'Megacenter Local 78, La Paz',
      detalles: 'Tienda en centro comercial',
      horarios: '10:00 - 22:00',
      maxAdministradores: 2,
      estado: 'ACTIVO',
      empresaId: empresa3.id,
    },
  });

  const owner3 = await prisma.usuario.upsert({
    where: { ci_empresaId: { ci: '77889900', empresaId: empresa3.id } },
    update: {},
    create: {
      nombreCompleto: 'Roberto Chávez',
      ci: '77889900',
      correo: 'roberto@email.com',
      telefono: '72277889',
      edad: 35,
      password: hashPassword('admin123'),
      debeCambiarPass: false,
      rol: 'OWNER_PRINCIPAL',
      estado: 'ACTIVO',
      empresaId: empresa3.id,
    },
  });

  const admin3 = await prisma.usuario.upsert({
    where: { ci_empresaId: { ci: '88990011', empresaId: empresa3.id } },
    update: {},
    create: {
      nombreCompleto: 'Sofía Mamani',
      ci: '88990011',
      correo: 'sofia@email.com',
      telefono: '72288990',
      edad: 26,
      password: hashPassword('88990011'),
      debeCambiarPass: true,
      rol: 'ADMINISTRADOR',
      estado: 'ACTIVO',
      empresaId: empresa3.id,
      sucursalId: suc3a.id,
    },
  });

  console.log('✅ Empresa 3:', empresa3.nombre);
  console.log('   Owner:', owner3.nombreCompleto, '| Admin:', admin3.nombreCompleto);

  // ── 5. Prendas demo (empresa 1) ──
  const prendasData = [
    { codigo: '7501234567890', tipoCodigo: 'BARRAS' as const, marca: 'Bershka', tipo: 'Blusa', detalles: 'Blusa floral manga corta', estado: 'NUEVO' as const, precio: 150, sucursalId: suc1a.id },
    { codigo: 'QR-ZARA-001', tipoCodigo: 'QR' as const, marca: 'Zara', tipo: 'Pantalón', detalles: 'Pantalón slim fit negro', estado: 'NUEVO' as const, precio: 280, rebaja: 250, publicadoWeb: true, sucursalId: suc1a.id },
    { codigo: 'MAN-HM-055', tipoCodigo: 'MANUAL' as const, marca: 'H&M', tipo: 'Vestido', detalles: 'Vestido casual verano', estado: 'SEMI_NUEVO' as const, precio: 200, sucursalId: suc1b.id },
    { codigo: '8901234567890', tipoCodigo: 'BARRAS' as const, marca: 'Pull&Bear', tipo: 'Short', detalles: 'Short denim clásico', estado: 'NUEVO' as const, precio: 120, publicadoWeb: true, sucursalId: suc1a.id },
    { codigo: 'QR-MNG-012', tipoCodigo: 'QR' as const, marca: 'Mango', tipo: 'Falda', detalles: 'Falda plisada midi', estado: 'NUEVO' as const, precio: 180, sucursalId: suc1b.id },
  ];

  for (const p of prendasData) {
    await prisma.prenda.upsert({
      where: { codigo_empresaId: { codigo: p.codigo, empresaId: empresa1.id } },
      update: {},
      create: { ...p, empresaId: empresa1.id },
    });
  }
  console.log('✅ 5 prendas demo creadas (Boutique Elegance)');

  console.log('\n🎉 ¡Seed completado exitosamente!');
  console.log('\n📋 Credenciales de prueba (todos con contraseña: admin123):');
  console.log('');
  console.log('  🏢 Boutique Elegance');
  console.log('     Owner:    carlos@email.com / admin123');
  console.log('     Admin:    ana@email.com / 23456789 (pedirá cambio)');
  console.log('     Empleado: luis@email.com / 34567890 (pedirá cambio)');
  console.log('');
  console.log('  🏢 ClickModa Store');
  console.log('     Owner:    maria@email.com / admin123');
  console.log('     Empleado: diego@email.com / 55667788 (pedirá cambio)');
  console.log('');
  console.log('  🏢 Urban Style Bolivia');
  console.log('     Owner:    roberto@email.com / admin123');
  console.log('     Admin:    sofia@email.com / 88990011 (pedirá cambio)');
}

main()
  .catch((e) => { console.error('❌ Error en seed:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });