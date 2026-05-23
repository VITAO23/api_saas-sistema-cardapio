"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateProductService = void 0;
const prisma_1 = require("../../lib/prisma");
class UpdateProductService {
    async execute({ id, categoryId, userId, optionGroups, ...data }) {
        const user = await prisma_1.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new Error('User not found');
        if (!user.restaurantId)
            throw new Error('Restaurant not assigned yet');
        const product = await prisma_1.prisma.product.findUnique({ where: { id } });
        if (!product || product.restaurantId !== user.restaurantId) {
            throw new Error('Product not found');
        }
        if (categoryId) {
            const category = await prisma_1.prisma.category.findUnique({ where: { id: categoryId } });
            if (!category || category.restaurantId !== user.restaurantId) {
                throw new Error('Category not found');
            }
        }
        const updatedProduct = await prisma_1.prisma.product.update({
            where: { id },
            data: {
                ...data,
                categoryId
            }
        });
        if (optionGroups) {
            await prisma_1.prisma.productOptionGroup.deleteMany({
                where: { productId: id }
            });
            await prisma_1.prisma.product.update({
                where: { id },
                data: {
                    optionGroups: {
                        create: optionGroups.map((group) => ({
                            name: group.name,
                            multiple: group.multiple ?? false,
                            required: group.required ?? false,
                            options: {
                                create: (group.options ?? []).map((option) => ({
                                    name: option.name,
                                    price: option.price ?? null
                                }))
                            }
                        }))
                    }
                }
            });
        }
        return prisma_1.prisma.product.findUnique({
            where: { id },
            include: { optionGroups: { include: { options: true } } }
        });
    }
}
exports.UpdateProductService = UpdateProductService;
