"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateUserService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = require("../../lib/prisma");
class CreateUserService {
    async execute({ name, email, password }) {
        const normalizedEmail = email.trim().toLowerCase();
        // Validate email format (simple)
        if (!normalizedEmail.includes('@')) {
            throw new Error('Invalid email');
        }
        // Check if user already exists
        const userExists = await prisma_1.prisma.user.findUnique({
            where: { email: normalizedEmail }
        });
        if (userExists) {
            throw new Error('User already exists');
        }
        // Hash password
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        // Create user
        const user = await prisma_1.prisma.user.create({
            data: {
                name,
                email: normalizedEmail,
                password: hashedPassword,
                role: 'user'
            }
        });
        // Return user without password
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
}
exports.CreateUserService = CreateUserService;
