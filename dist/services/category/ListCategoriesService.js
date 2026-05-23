"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListCategoriesService = void 0;
const prisma_1 = require("../../lib/prisma");
class ListCategoriesService {
    async execute(userId) {
        const user = await prisma_1.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new Error('User not found');
        }
        if (!user.restaurantId) {
            return [];
        }
        return prisma_1.prisma.category.findMany({ where: { restaurantId: user.restaurantId } });
    }
}
exports.ListCategoriesService = ListCategoriesService;
