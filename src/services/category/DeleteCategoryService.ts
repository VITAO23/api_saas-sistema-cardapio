import { prisma } from '../../lib/prisma';

export class DeleteCategoryService {
  async execute(id: string, userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) throw new Error('User not found');
    if (!user.restaurantId) throw new Error('Restaurant not assigned yet');

    const category = await prisma.category.findUnique({ where: { id } });

    if (!category || category.restaurantId !== user.restaurantId) {
      throw new Error('Category not found');
    }

    // Remove products that belong to this category first to avoid FK constraint errors
    await prisma.product.deleteMany({ where: { categoryId: id } });

    return prisma.category.delete({ where: { id } });
  }
}
