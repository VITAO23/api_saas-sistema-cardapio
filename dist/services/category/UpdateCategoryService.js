"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateCategoryService = void 0;
const prisma_1 = require("../../lib/prisma");
class UpdateCategoryService {
    async execute({ id, name, userId }) {
        const user = await prisma_1.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new Error('User not found');
        if (!user.restaurantId)
            throw new Error('Restaurant not assigned yet');
        const category = await prisma_1.prisma.category.findUnique({ where: { id } });
        if (!category || category.restaurantId !== user.restaurantId) {
            throw new Error('Category not found');
        }
        return prisma_1.prisma.category.update({ where: { id }, data: { name } });
    }
}
exports.UpdateCategoryService = UpdateCategoryService;
