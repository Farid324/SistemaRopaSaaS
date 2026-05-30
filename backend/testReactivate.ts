import { PrismaClient, Rol, EstadoGeneral } from '@prisma/client';

const prisma = new PrismaClient();

async function testReactivate() {
  try {
    // 1. Buscar al usuario "Kairox" que está CERRADO
    const u1 = await prisma.usuario.findFirst({
      where: { ci: '12345600' }
    });

    if (!u1) {
      console.log("No se encontro al usuario Kairox");
      return;
    }

    console.log("Found user:", u1.id, u1.estado);

    // 2. Intentar hacer el update
    const dataFromFront = {
      nombreCompleto: 'Kairox',
      ci: '12345600',
      correo: 'kairox488@gmail.com',
      telefono: '69445900',
      edad: 22,
      rol: Rol.EMPLEADO,
      estado: EstadoGeneral.ACTIVO
    };

    const updated = await prisma.usuario.update({
      where: { id: u1.id },
      data: dataFromFront,
    });
    console.log("Updated user:", updated.id, updated.estado);

  } catch (error) {
    console.error("ERROR:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testReactivate();
