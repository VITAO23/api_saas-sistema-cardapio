"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListProductsService = void 0;
const prisma_1 = require("../../lib/prisma");
class ListProductsService {
    async execute(userId) {
        const user = await prisma_1.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new Error('User not found');
        }
        if (!user.restaurantId) {
            return [];
        }
        return prisma_1.prisma.product.findMany({
            where: { restaurantId: user.restaurantId },
            include: {
                category: true,
                optionGroups: {
                    include: {
                        options: true
                    }
                }
            }
        });
    }
}
exports.ListProductsService = ListProductsService;
