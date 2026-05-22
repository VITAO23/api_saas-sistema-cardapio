import { prisma } from '../../lib/prisma';

export class DeleteProductService {
  async execute(id: string, userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');
    if (!user.restaurantId) throw new Error('Restaurant not assigned yet');

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product || product.restaurantId !== user.restaurantId) {
      throw new Error('Product not found');
    }

    return prisma.product.delete({ where: { id } });
  }
}
