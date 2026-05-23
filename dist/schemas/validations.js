"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateUserProfileSchema = exports.UpdateProductSchema = exports.CreateProductSchema = exports.UpdateCategorySchema = exports.CreateCategorySchema = exports.LoginSchema = exports.RegisterSchema = void 0;
const zod_1 = require("zod");
const stringToBoolean = zod_1.z.preprocess((value) => {
    if (typeof value === 'string') {
        if (value.toLowerCase() === 'true') {
            return true;
        }
        if (value.toLowerCase() === 'false') {
            return false;
        }
    }
    return value;
}, zod_1.z.boolean());
const stringToPositiveNumber = zod_1.z.preprocess((value) => {
    if (typeof value === 'string' && value.trim() !== '') {
        return Number(value);
    }
    return value;
}, zod_1.z.number().positive('Preço deve ser um número positivo'));
const ProductOptionSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Nome da opção é obrigatório'),
    price: zod_1.z
        .preprocess((value) => {
        if (value === '' || value === null || value === undefined) {
            return null;
        }
        if (typeof value === 'string' && value.trim() !== '') {
            return Number(value);
        }
        return value;
    }, zod_1.z.number().positive('Preço da opção deve ser positivo').nullable())
        .optional()
});
const ProductOptionGroupSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Nome do grupo é obrigatório'),
    multiple: zod_1.z.boolean().optional().default(false),
    required: zod_1.z.boolean().optional().default(false),
    options: zod_1.z.array(ProductOptionSchema).default([])
});
exports.RegisterSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
    email: zod_1.z.string().email('Email inválido'),
    password: zod_1.z.string().min(6, 'Senha deve ter pelo menos 6 caracteres')
});
exports.LoginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Email inválido'),
    password: zod_1.z.string().min(1, 'Senha é obrigatória')
});
exports.CreateCategorySchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Nome da categoria deve ter pelo menos 2 caracteres')
});
exports.UpdateCategorySchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Nome da categoria deve ter pelo menos 2 caracteres').optional()
});
exports.CreateProductSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Nome do produto deve ter pelo menos 2 caracteres'),
    description: zod_1.z.string().optional(),
    price: stringToPositiveNumber,
    imageUrl: zod_1.z.string().url('URL da imagem inválida').optional().or(zod_1.z.literal('')),
    categoryId: zod_1.z.string().uuid('ID da categoria inválido'),
    available: stringToBoolean.optional().default(true),
    optionGroups: zod_1.z.array(ProductOptionGroupSchema).optional().default([])
});
exports.UpdateProductSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Nome do produto deve ter pelo menos 2 caracteres').optional(),
    description: zod_1.z.string().optional(),
    price: stringToPositiveNumber.optional(),
    imageUrl: zod_1.z.string().url('URL da imagem inválida').optional().or(zod_1.z.literal('')),
    categoryId: zod_1.z.string().uuid('ID da categoria inválido').optional(),
    available: stringToBoolean.optional(),
    optionGroups: zod_1.z.array(ProductOptionGroupSchema).optional()
});
exports.UpdateUserProfileSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').optional(),
    email: zod_1.z.string().email('Email inválido').optional(),
    password: zod_1.z.string().min(6, 'Senha deve ter pelo menos 6 caracteres').optional(),
    restaurantAddress: zod_1.z.string().optional()
});
