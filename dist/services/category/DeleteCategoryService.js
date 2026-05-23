"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteCategoryService = void 0;
const prisma_1 = require("../../lib/prisma");
class DeleteCategoryService {
    async execute(id, userId) {
        const user = await prisma_1.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new Error('User not found');
        if (!user.restaurantId)
            throw new Error('Restaurant not assigned yet');
        const category = await prisma_1.prisma.category.findUnique({ where: { id } });
        if (!category || category.restaurantId !== user.restaurantId) {
            throw new Error('Category not found');
        }
        // Remove products that belong to this category first to avoid FK constraint errors
        await prisma_1.prisma.product.deleteMany({ where: { categoryId: id } });
        return prisma_1.prisma.category.delete({ where: { id } });
    }
}
exports.DeleteCategoryService = DeleteCategoryService;
