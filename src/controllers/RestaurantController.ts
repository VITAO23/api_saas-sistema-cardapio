import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { getPublicOrigin } from '../lib/urlUtils';

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
        address: true,
        logoUrl: true,
        status: true,
        openingHours: true,
        deliveryEnabled: true,
        deliveryTime: true,
        pickupTime: true,
        deliveryInfo: true,
        deliveryFee: true,
        deliveryRadiusKm: true,
        deliveryArea: true
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

      return res.json({ restaurant, logoUrl: restaurant.logoUrl });
    } catch (error) {
      return res.status(400).json({
        error: error instanceof Error ? error.message : 'Error'
      });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const user = await prisma.user.findUnique({ where: { id: req.userId }, select: { restaurantId: true } });
      if (!user) return res.status(404).json({ error: 'User not found' });

      const {
        name,
        address,
        whatsapp,
        status,
        openingHours,
        deliveryEnabled,
        deliveryTime,
        pickupTime,
        deliveryInfo,
        deliveryFee,
        deliveryRadiusKm
      } = req.body;

      const data: any = {};
      if (name !== undefined) data.name = String(name).trim();
      if (address !== undefined) data.address = String(address).trim();
      if (whatsapp !== undefined) data.whatsapp = String(whatsapp).trim();
      if (status !== undefined) data.status = String(status).trim();
      if (openingHours !== undefined) data.openingHours = String(openingHours).trim();
      if (deliveryEnabled !== undefined) data.deliveryEnabled = Boolean(deliveryEnabled);
      if (deliveryTime !== undefined) data.deliveryTime = String(deliveryTime).trim();
      if (pickupTime !== undefined) data.pickupTime = String(pickupTime).trim();
      if (deliveryInfo !== undefined) data.deliveryInfo = String(deliveryInfo).trim();
      if (deliveryFee !== undefined) data.deliveryFee = parseFloat(String(deliveryFee)) || null;
      if (deliveryRadiusKm !== undefined) data.deliveryRadiusKm = parseFloat(String(deliveryRadiusKm)) || null;

      const restaurant = await prisma.restaurant.update({
        where: { id: user.restaurantId },
        data,
        select: {
          id: true,
          name: true,
          slug: true,
          whatsapp: true,
          address: true,
          logoUrl: true,
          status: true,
          openingHours: true,
          deliveryEnabled: true,
          deliveryTime: true,
          pickupTime: true,
          deliveryInfo: true,
          deliveryFee: true,
          deliveryRadiusKm: true,
          deliveryArea: true
        }
      });

      return res.json(restaurant);
    } catch (err: any) {
      return res.status(400).json({ error: err?.message ?? 'Error' });
    }
  }

  async setDeliveryArea(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = await prisma.user.findUnique({ where: { id: req.userId }, select: { restaurantId: true } });
      if (!user) return res.status(404).json({ error: 'User not found' });
      if (user.restaurantId !== id) return res.status(403).json({ error: 'Not allowed to modify this restaurant' });

      const geojson = req.body;
      if (!geojson || typeof geojson !== 'object') return res.status(400).json({ error: 'Invalid GeoJSON body' });

      const restaurant = await prisma.restaurant.update({
        where: { id },
        data: { deliveryArea: geojson },
        select: { id: true, deliveryArea: true }
      });

      return res.json(restaurant);
    } catch (err: any) {
      return res.status(400).json({ error: err?.message ?? 'Error' });
    }
  }
}
