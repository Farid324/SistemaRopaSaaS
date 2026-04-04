// backend/server.ts

import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 4000;

// Middlewares básicos
app.use(cors()); // Permite que tu app móvil se conecte sin bloqueos
app.use(express.json()); // Permite recibir datos en formato JSON

// 1. Ruta para listar todas las prendas
app.get('/api/prendas', async (req, res) => {
  try {
    const prendas = await prisma.prenda.findMany(); // Prisma busca en Supabase
    res.json(prendas); // El servidor responde a la app/web
  } catch (error) {
    res.status(500).json({ error: 'Hubo un error al buscar las prendas' });
  }
});

// 2. Ruta para crear una prenda nueva (El mesero guarda un dato nuevo)
app.post('/api/prendas', async (req, res) => {
  try {
    const nuevaPrenda = await prisma.prenda.create({
      data: req.body // Los datos que enviará tu celular
    });
    res.json(nuevaPrenda);
  } catch (error) {
    res.status(500).json({ error: 'No se pudo registrar la prenda' });
  }
});

// Arrancar el motor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});