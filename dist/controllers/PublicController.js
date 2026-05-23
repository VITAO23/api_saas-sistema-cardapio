"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicController = void 0;
const prisma_1 = require("../lib/prisma");
const urlUtils_1 = require("../lib/urlUtils");
class PublicController {
    async show(req, res) {
        const { slug } = req.params;
        const restaurant = await prisma_1.prisma.restaurant.findUnique({
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
        return res.json(restaurant);
    }
    async qr(req, res) {
        const { slug } = req.params;
        const restaurant = await prisma_1.prisma.restaurant.findUnique({ where: { slug }, select: { id: true, name: true } });
        if (!restaurant) {
            return res.status(404).json({ error: 'Restaurant not found' });
        }
        // Build public URL (assume frontend at CORS_ORIGINS[0] or use relative path)
        const origin = (0, urlUtils_1.getPublicOrigin)();
        const menuUrl = `${origin}/r/${slug}`;
        try {
            // dynamic require to avoid dev dependency issues
            // use qrcode to generate PNG buffer
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const QRCode = require('qrcode');
            const buffer = await QRCode.toBuffer(menuUrl, { type: 'png', width: 300 });
            res.setHeader('Content-Type', 'image/png');
            return res.send(buffer);
        }
        catch (err) {
            return res.status(500).json({ error: 'Failed to generate QR code', details: err?.message });
        }
    }
}
exports.PublicController = PublicController;
exports.default = PublicController;
