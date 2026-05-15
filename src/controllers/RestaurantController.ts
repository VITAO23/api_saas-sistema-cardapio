import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

function getPublicOrigin() {
  const corsOrigins = (process.env.CORS_ORIGINS ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);

  return process.env.PUBLIC_ORIGIN ?? corsOrigins[0] ?? `http://localhost:${process.env.PORT ?? 3333}`;
}

export class RestaurantController {
  async me(req: Request, res: Response) {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { restaurantId: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: user.restaurantId },
      select: {
        id: true,
        name: true,
        slug: true,
        whatsapp: true,
        logoUrl: true
      }
    });

    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    const publicOrigin = getPublicOrigin();

    return res.json({
      ...restaurant,
      publicMenuUrl: `${publicOrigin}/r/${restaurant.slug}`,
      publicMenuAliasUrl: `${publicOrigin}/restaurants/${restaurant.slug}`,
      qrUrl: `${publicOrigin}/restaurants/${restaurant.slug}/qr`
    });
  }

  async myQr(req: Request, res: Response) {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { restaurantId: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: user.restaurantId },
      select: { slug: true }
    });

    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    const publicOrigin = getPublicOrigin();
    const menuUrl = `${publicOrigin}/r/${restaurant.slug}`;

    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const QRCode = require('qrcode');
      const buffer = await QRCode.toBuffer(menuUrl, { type: 'png', width: 300 });

      res.setHeader('Content-Type', 'image/png');
      return res.send(buffer);
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to generate QR code', details: err?.message });
    }
  }

  async uploadLogo(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file provided' });
      }

      const user = await prisma.user.findUnique({
        where: { id: req.userId },
        select: { restaurantId: true }
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const logoUrl = `/uploads/logos/${req.file.filename}`;

      const restaurant = await prisma.restaurant.update({
        where: { id: user.restaurantId },
        data: { logoUrl },
        select: {
          id: true,
          name: true,
          slug: true,
          logoUrl: true
        }
      });

      return res.json({ restaurant, logoUrl });
    } catch (error) {
      return res.status(400).json({
        error: error instanceof Error ? error.message : 'Error'
      });
    }
  }
}
