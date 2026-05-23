import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { getPublicOrigin, resolvePublicAssetUrl } from '../lib/urlUtils';

export class RestaurantController {
  async me(req: Request, res: Response) {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { restaurantId: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.restaurantId) {
      return res.json({
        id: null,
        name: '',
        slug: '',
        whatsapp: '',
        address: null,
        street: null,
        number: null,
        complement: null,
        neighborhood: null,
        city: null,
        state: null,
        zipCode: null,
        logoUrl: null,
        status: null,
        openingHours: null,
        deliveryEnabled: false,
        deliveryTime: null,
        pickupTime: null,
        deliveryInfo: null,
        deliveryFee: null,
        deliveryRadiusKm: null,
        deliveryArea: null,
        publicMenuUrl: null,
        publicMenuAliasUrl: null,
        qrUrl: null
      });
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: user.restaurantId },
      select: {
        id: true,
        name: true,
        slug: true,
        whatsapp: true,
        address: true,
        street: true,
        number: true,
        complement: true,
        neighborhood: true,
        city: true,
        state: true,
        zipCode: true,
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

    if (!user.restaurantId) {
      return res.status(400).json({ error: 'Restaurant not assigned yet' });
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

      if (!user.restaurantId) {
        return res.status(400).json({ error: 'Restaurant not assigned yet' });
      }

      const logoUrl = resolvePublicAssetUrl((req.file as any).publicUrl ?? `/uploads/logos/${(req.file as any).filename}`);

      const restaurant = await prisma.restaurant.update({
        where: { id: user.restaurantId },
        data: { logoUrl },
        select: {
          id: true,
          name: true,
          slug: true,
          address: true,
          street: true,
          number: true,
          complement: true,
          neighborhood: true,
          city: true,
          state: true,
          zipCode: true,
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
        street,
        number,
        complement,
        neighborhood,
        city,
        state,
        zipCode,
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
      if (street !== undefined) data.street = String(street).trim();
      if (number !== undefined) data.number = String(number).trim();
      if (complement !== undefined) data.complement = String(complement).trim();
      if (neighborhood !== undefined) data.neighborhood = String(neighborhood).trim();
      if (city !== undefined) data.city = String(city).trim();
      if (state !== undefined) data.state = String(state).trim();
      if (zipCode !== undefined) data.zipCode = String(zipCode).trim();
      if (whatsapp !== undefined) data.whatsapp = String(whatsapp).trim();
      if (status !== undefined) data.status = String(status).trim();
      if (openingHours !== undefined) data.openingHours = String(openingHours).trim();
      if (deliveryEnabled !== undefined) data.deliveryEnabled = Boolean(deliveryEnabled);
      if (deliveryTime !== undefined) data.deliveryTime = String(deliveryTime).trim();
      if (pickupTime !== undefined) data.pickupTime = String(pickupTime).trim();
      if (deliveryInfo !== undefined) data.deliveryInfo = String(deliveryInfo).trim();
      if (deliveryFee !== undefined) data.deliveryFee = parseFloat(String(deliveryFee)) || null;
      if (deliveryRadiusKm !== undefined) data.deliveryRadiusKm = parseFloat(String(deliveryRadiusKm)) || null;

      const restaurantData: any = {
        name: data.name ?? '',
        slug: data.name ? String(data.name).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') : `restaurant-${Date.now()}`,
        whatsapp: data.whatsapp ?? '',
        address: data.address ?? null,
        street: data.street ?? null,
        number: data.number ?? null,
        complement: data.complement ?? null,
        neighborhood: data.neighborhood ?? null,
        city: data.city ?? null,
        state: data.state ?? null,
        zipCode: data.zipCode ?? null,
        status: data.status ?? null,
        openingHours: data.openingHours ?? null,
        deliveryEnabled: data.deliveryEnabled ?? false,
        deliveryTime: data.deliveryTime ?? null,
        pickupTime: data.pickupTime ?? null,
        deliveryInfo: data.deliveryInfo ?? null,
        deliveryFee: data.deliveryFee ?? null,
        deliveryRadiusKm: data.deliveryRadiusKm ?? null,
        deliveryArea: Prisma.JsonNull
      };

      const restaurant = user.restaurantId
        ? await prisma.restaurant.update({
            where: { id: user.restaurantId },
            data,
            select: {
              id: true,
              name: true,
              slug: true,
              whatsapp: true,
              address: true,
              street: true,
              number: true,
              complement: true,
              neighborhood: true,
              city: true,
              state: true,
              zipCode: true,
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
          })
        : await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            const createdRestaurant = await tx.restaurant.create({
              data: restaurantData,
              select: {
                id: true,
                name: true,
                slug: true,
                whatsapp: true,
                address: true,
                street: true,
                number: true,
                complement: true,
                neighborhood: true,
                city: true,
                state: true,
                zipCode: true,
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

            await tx.user.update({
              where: { id: req.userId },
              data: { restaurantId: createdRestaurant.id }
            });

            return createdRestaurant;
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
      if (!user.restaurantId) return res.status(400).json({ error: 'Restaurant not assigned yet' });
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
