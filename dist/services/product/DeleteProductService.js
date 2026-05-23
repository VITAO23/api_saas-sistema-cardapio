"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteProductService = void 0;
const prisma_1 = require("../../lib/prisma");
class DeleteProductService {
    async execute(id, userId) {
        const user = await prisma_1.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new Error('User not found');
        if (!user.restaurantId)
            throw new Error('Restaurant not assigned yet');
        const product = await prisma_1.prisma.product.findUnique({ where: { id } });
        if (!product || product.restaurantId !== user.restaurantId) {
            throw new Error('Product not found');
        }
        return prisma_1.prisma.product.delete({ where: { id } });
    }
}
exports.DeleteProductService = DeleteProductService;
