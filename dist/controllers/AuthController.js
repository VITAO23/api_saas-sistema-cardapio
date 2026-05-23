"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const LoginService_1 = require("../services/auth/LoginService");
const CreateUserService_1 = require("../services/auth/CreateUserService");
const validations_1 = require("../schemas/validations");
const prisma_1 = require("../lib/prisma");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const urlUtils_1 = require("../lib/urlUtils");
class AuthController {
    async login(req, res) {
        try {
            // Debug: log raw incoming body to diagnose invalid Prisma where invocation
            console.log('[Auth] POST /login body:', req.body);
            const parsed = validations_1.LoginSchema.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({ errors: parsed.error.flatten() });
            }
            const { email, password } = parsed.data;
            // Debug: log email only (avoid logging passwords)
            console.log('[Auth] login attempt for:', email);
            const service = new LoginService_1.LoginService();
            const result = await service.execute(email, password);
            return res.json(result);
        }
        catch (error) {
            return res.status(400).json({
                error: error instanceof Error ? error.message : 'Error'
            });
        }
    }
    async register(req, res) {
        try {
            const parsed = validations_1.RegisterSchema.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({ errors: parsed.error.flatten() });
            }
            const { name, email, password } = parsed.data;
            const service = new CreateUserService_1.CreateUserService();
            const user = await service.execute({
                name,
                email,
                password
            });
            const token = jsonwebtoken_1.default.sign({}, process.env.JWT_SECRET, {
                subject: user.id,
                expiresIn: '7d'
            });
            return res.status(201).json({ user, token });
        }
        catch (error) {
            return res.status(400).json({
                error: error instanceof Error ? error.message : 'Error'
            });
        }
    }
    async me(req, res) {
        try {
            const user = await prisma_1.prisma.user.findUnique({
                where: { id: req.userId },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    restaurantId: true,
                    restaurant: {
                        select: {
                            id: true,
                            name: true,
                            slug: true
                        }
                    }
                }
            });
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            return res.json(user);
        }
        catch (error) {
            return res.status(400).json({
                error: error instanceof Error ? error.message : 'Error'
            });
        }
    }
    async updateMe(req, res) {
        try {
            const parsed = validations_1.UpdateUserProfileSchema.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({ errors: parsed.error.flatten() });
            }
            const { name, email, password, restaurantAddress } = parsed.data;
            const updateUserData = {};
            if (name)
                updateUserData.name = name;
            if (email) {
                // Check if email already exists
                const existingUser = await prisma_1.prisma.user.findUnique({
                    where: { email: email.toLowerCase() }
                });
                if (existingUser && existingUser.id !== req.userId) {
                    return res.status(409).json({ error: 'Email already in use' });
                }
                updateUserData.email = email.toLowerCase();
            }
            if (password) {
                const hashedPassword = await bcryptjs_1.default.hash(password, 8);
                updateUserData.password = hashedPassword;
            }
            // Get user's restaurant ID
            const user = await prisma_1.prisma.user.findUnique({
                where: { id: req.userId },
                select: { restaurantId: true }
            });
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            // Update restaurant address if provided
            if (restaurantAddress !== undefined) {
                if (!user.restaurantId) {
                    return res.status(400).json({ error: 'User has no restaurant assigned' });
                }
                await prisma_1.prisma.restaurant.update({
                    where: { id: user.restaurantId },
                    data: { address: restaurantAddress }
                });
            }
            const updatedUser = await prisma_1.prisma.user.update({
                where: { id: req.userId },
                data: updateUserData,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    restaurantId: true
                }
            });
            return res.json(updatedUser);
        }
        catch (error) {
            return res.status(400).json({
                error: error instanceof Error ? error.message : 'Error'
            });
        }
    }
    async uploadAvatar(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'No file provided' });
            }
            const avatarUrl = (0, urlUtils_1.resolvePublicAssetUrl)(req.file.publicUrl ?? `/uploads/avatars/${req.file.filename}`);
            const user = await prisma_1.prisma.user.update({
                where: { id: req.userId },
                data: { avatarUrl },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    avatarUrl: true
                }
            });
            return res.json({ user, avatarUrl: user.avatarUrl });
        }
        catch (error) {
            return res.status(400).json({
                error: error instanceof Error ? error.message : 'Error'
            });
        }
    }
}
exports.AuthController = AuthController;
