import { prisma } from '../config/prisma';

export const configService = {
  async getConfig(clave: string) {
    const config = await prisma.configuracion.findUnique({ where: { clave } });
    return config ? config.valor : null;
  },

  async updateConfig(clave: string, valor: string) {
    const config = await prisma.configuracion.upsert({
      where: { clave },
      update: { valor },
      create: { clave, valor },
    });
    return config;
  },

  async getAllConfig() {
    return await prisma.configuracion.findMany();
  }
};
