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
  optionGroups?: Array<{
    name: string;
    multiple?: boolean;
    required?: boolean;
    options?: Array<{
      name: string;
      price?: number | null;
    }>;
  }>;
}

export class UpdateProductService {
  async execute({ id, categoryId, userId, optionGroups, ...data }: IRequest) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');
    if (!user.restaurantId) throw new Error('Restaurant not assigned yet');

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

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        ...data,
        categoryId
      }
    });

    if (optionGroups) {
      await prisma.productOptionGroup.deleteMany({
        where: { productId: id }
      });

      await prisma.product.update({
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

    return prisma.product.findUnique({
      where: { id },
      include: { optionGroups: { include: { options: true } } }
    });
  }
}
