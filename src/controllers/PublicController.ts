import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

function getPublicOrigin() {
  const corsOrigins = (process.env.CORS_ORIGINS ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);

  return process.env.PUBLIC_ORIGIN ?? corsOrigins[0] ?? `http://localhost:${process.env.PORT ?? 3333}`;
}

function toAbsoluteUrl(url?: string | null) {
  if (!url) {
    return undefined;
  }

  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  return `${getPublicOrigin()}${url}`;
}

export class PublicController {
  async show(req: Request, res: Response) {
    const { slug } = req.params;

    const restaurant = await prisma.restaurant.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        whatsapp: true,
        logoUrl: true,
        categories: {
          select: {
            id: true,
            name: true,
            products: {
              where: { available: true },
              select: {
                id: true,
                name: true,
                description: true,
                price: true,
                imageUrl: true
              }
            }
          }
        }
      }
    });

    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    return res.json({
      ...restaurant,
      logoUrl: toAbsoluteUrl(restaurant.logoUrl),
      categories: restaurant.categories.map((category: {
        id: string;
        name: string;
        products: Array<{
          id: string;
          name: string;
          description: string | null;
          price: number;
          imageUrl: string | null;
        }>;
      }) => ({
        ...category,
        products: category.products.map((product: {
          id: string;
          name: string;
          description: string | null;
          price: number;
          imageUrl: string | null;
        }) => ({
          ...product,
          imageUrl: toAbsoluteUrl(product.imageUrl)
        }))
      }))
    });
  }

  async qr(req: Request, res: Response) {
    const { slug } = req.params;

    const restaurant = await prisma.restaurant.findUnique({ where: { slug }, select: { id: true, name: true } });

    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    // Build public URL (assume frontend at CORS_ORIGINS[0] or use relative path)
    const origin = process.env.PUBLIC_ORIGIN ?? `http://localhost:${process.env.PORT ?? 3333}`;
    const menuUrl = `${origin}/r/${slug}`;

    try {
      // dynamic require to avoid dev dependency issues
      // use qrcode to generate PNG buffer
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const QRCode = require('qrcode');

      const buffer = await QRCode.toBuffer(menuUrl, { type: 'png', width: 300 });

      res.setHeader('Content-Type', 'image/png');
      return res.send(buffer);
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to generate QR code', details: err?.message });
    }
  }
}

export default PublicController;
