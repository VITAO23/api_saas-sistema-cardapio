import { prisma } from '../../lib/prisma';

interface IRequest {
  name: string;
  description?: string | undefined;
  price: number;
  imageUrl?: string | undefined;
  categoryId: string;
  available: boolean;
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

export class CreateProductService {
  async execute({ userId, categoryId, optionGroups = [], ...data }: IRequest) {
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
        restaurantId: user.restaurantId,
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
      },
      include: {
        optionGroups: {
          include: {
            options: true
          }
        }
      }
    });
  }
}