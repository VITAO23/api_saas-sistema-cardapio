import { prisma } from '../../lib/prisma';

interface IRequest {
  name: string;
  description?: string | undefined;
  price: number;
  imageUrl?: string | undefined;
  categoryId: string;
  available: boolean;
  userId: string;
}

export class CreateProductService {
  async execute({ userId, categoryId, ...data }: IRequest) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (!user.restaurantId) {
      throw new Error('Restaurant not assigned yet');
    }

    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        restaurantId: user.restaurantId
      }
    });

    if (!category) {
      throw new Error('Category not found');
    }

    return prisma.product.create({
      data: {
        ...data,
        categoryId,
        restaurantId: user.restaurantId
      }
    });
  }
}