import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { getPublicOrigin, resolvePublicAssetUrl } from '../lib/urlUtils';

function isAllowedProxyTarget(rawUrl: string) {
  try {
    const parsedUrl = new URL(rawUrl);

    if (parsedUrl.protocol !== 'https:') {
      return false;
    }

    return (
      parsedUrl.hostname.endsWith('.supabase.co') ||
      parsedUrl.hostname === 'supabase.co' ||
      parsedUrl.hostname.endsWith('.supabase.in') ||
      parsedUrl.hostname === 'supabase.in'
    );
  } catch {
    return false;
  }
}

function normalizeRestaurantAssets<T extends { logoUrl: string | null }>(restaurant: T) {
  return {
    ...restaurant,
    logoUrl: resolvePublicAssetUrl(restaurant.logoUrl)
  };
}

function normalizeCategories(categories: Array<{
  id: string;
  name: string;
  products: Array<{ id: string; name: string; description: string | null; price: number; imageUrl: string | null }>;
}>) {
  return categories.map((category) => ({
    ...category,
    products: category.products.map((product) => ({
      ...product,
      imageUrl: resolvePublicAssetUrl(product.imageUrl)
    }))
  }));
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
        deliveryArea: true,
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
      ...normalizeRestaurantAssets(restaurant),
      categories: normalizeCategories(restaurant.categories)
    });
  }

  async qr(req: Request, res: Response) {
    const { slug } = req.params;

    const restaurant = await prisma.restaurant.findUnique({ where: { slug }, select: { id: true, name: true } });

    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    // Build public URL (assume frontend at CORS_ORIGINS[0] or use relative path)
    const origin = getPublicOrigin();
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

  async proxyAsset(req: Request, res: Response) {
    const rawUrl = String(req.query.url ?? '').trim();

    if (!rawUrl) {
      return res.status(400).json({ error: 'Missing url parameter' });
    }

    if (!isAllowedProxyTarget(rawUrl)) {
      return res.status(400).json({ error: 'Invalid proxy target' });
    }

    return res.redirect(302, rawUrl);
  }
}

export default PublicController;
