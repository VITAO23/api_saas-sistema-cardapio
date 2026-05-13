import { prisma } from '../../lib/prisma';

interface IRequest {
  id: string;
  name?: string;
  userId: string;
}

export class UpdateCategoryService {
  async execute({ id, name, userId }: IRequest) {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) throw new Error('User not found');

    const category = await prisma.category.findUnique({ where: { id } });

    if (!category || category.restaurantId !== user.restaurantId) {
      throw new Error('Category not found');
    }

    return prisma.category.update({ where: { id }, data: { name } });
  }
}
