import { prisma } from '../../lib/prisma';

interface IRequest {
  id: string;
  name?: string | undefined;
  description?: string | undefined;
  price?: number | undefined;
  imageUrl?: string | undefined;
  available?: boolean | undefined;
  categoryId?: string | undefined;
  userId: string;
}

export class UpdateProductService {
  async execute({ id, categoryId, userId, ...data }: IRequest) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product || product.restaurantId !== user.restaurantId) {
      throw new Error('Product not found');
    }

    if (categoryId) {
      const category = await prisma.category.findUnique({ where: { id: categoryId } });
      if (!category || category.restaurantId !== user.restaurantId) {
        throw new Error('Category not found');
      }
    }

    return prisma.product.update({ where: { id }, data: { ...data, categoryId } });
  }
}
