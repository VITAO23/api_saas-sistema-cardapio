import { z } from 'zod';

export const RegisterSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  restaurantId: z.string().uuid('ID do restaurante inválido')
});

export const LoginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória')
});

export const CreateCategorySchema = z.object({
  name: z.string().min(2, 'Nome da categoria deve ter pelo menos 2 caracteres')
});

export const UpdateCategorySchema = z.object({
  name: z.string().min(2, 'Nome da categoria deve ter pelo menos 2 caracteres').optional()
});

export const CreateProductSchema = z.object({
  name: z.string().min(2, 'Nome do produto deve ter pelo menos 2 caracteres'),
  description: z.string().optional(),
  price: z.number().positive('Preço deve ser um número positivo'),
  imageUrl: z.string().url('URL da imagem inválida').optional().or(z.literal('')),
  categoryId: z.string().uuid('ID da categoria inválido'),
  available: z.boolean().optional().default(true)
});

export const UpdateProductSchema = z.object({
  name: z.string().min(2, 'Nome do produto deve ter pelo menos 2 caracteres').optional(),
  description: z.string().optional(),
  price: z.number().positive('Preço deve ser um número positivo').optional(),
  imageUrl: z.string().url('URL da imagem inválida').optional().or(z.literal('')),
  categoryId: z.string().uuid('ID da categoria inválido').optional(),
  available: z.boolean().optional()
});

export type RegisterType = z.infer<typeof RegisterSchema>;
export type LoginType = z.infer<typeof LoginSchema>;
export type CreateCategoryType = z.infer<typeof CreateCategorySchema>;
export type UpdateCategoryType = z.infer<typeof UpdateCategorySchema>;
export type CreateProductType = z.infer<typeof CreateProductSchema>;
export type UpdateProductType = z.infer<typeof UpdateProductSchema>;
