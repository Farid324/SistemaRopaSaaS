import { Request, Response } from 'express';
import { configService } from '../../services/config.service';

export const configController = {
  async getQrPago(req: Request, res: Response) {
    try {
      const qrUrl = await configService.getConfig('QR_PAGO_URL');
      res.json({ qrUrl: qrUrl || '' });
    } catch (e) {
      res.status(500).json({ message: 'Error al obtener configuración' });
    }
  },

  async updateQrPago(req: Request, res: Response) {
    try {
      const { qrUrl } = req.body;
      await configService.updateConfig('QR_PAGO_URL', qrUrl || '');
      res.json({ success: true, message: 'QR actualizado' });
    } catch (e) {
      res.status(500).json({ message: 'Error al actualizar configuración' });
    }
  }
};
