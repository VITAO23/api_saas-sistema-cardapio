import { Request, Response } from 'express';
import { LoginService } from '../services/auth/LoginService';
import { CreateUserService } from '../services/auth/CreateUserService';
import { LoginSchema, RegisterSchema, UpdateUserProfileSchema } from '../schemas/validations';
import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { resolvePublicAssetUrl } from '../lib/urlUtils';

export class AuthController {
  async login(req: Request, res: Response) {
    try {
      // Debug: log raw incoming body to diagnose invalid Prisma where invocation
      console.log('[Auth] POST /login body:', req.body);
      const parsed = LoginSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ errors: parsed.error.flatten() });
      }

      const { email, password } = parsed.data;

      // Debug: log email only (avoid logging passwords)
      console.log('[Auth] login attempt for:', email);

      const service = new LoginService();

      const result = await service.execute(email, password);

      return res.json(result);
    } catch (error) {
      return res.status(400).json({
        error: error instanceof Error ? error.message : 'Error'
      });
    }
  }

  async register(req: Request, res: Response) {
    try {
      const parsed = RegisterSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ errors: parsed.error.flatten() });
      }

      const { name, email, password } = parsed.data;

      const service = new CreateUserService();

      const user = await service.execute({
        name,
        email,
        password
      });

      const token = jwt.sign({}, process.env.JWT_SECRET as string, {
        subject: user.id,
        expiresIn: '7d'
      });

      return res.status(201).json({ user, token });
    } catch (error) {
      return res.status(400).json({
        error: error instanceof Error ? error.message : 'Error'
      });
    }
  }

  async me(req: Request, res: Response) {
    try {
      const user = await prisma.user.findUnique({
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
    } catch (error) {
      return res.status(400).json({
        error: error instanceof Error ? error.message : 'Error'
      });
    }
  }

  async updateMe(req: Request, res: Response) {
    try {
      const parsed = UpdateUserProfileSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ errors: parsed.error.flatten() });
      }

      const { name, email, password, restaurantAddress } = parsed.data;
      const updateUserData: any = {};

      if (name) updateUserData.name = name;
      if (email) {
        // Check if email already exists
        const existingUser = await prisma.user.findUnique({
          where: { email: email.toLowerCase() }
        });

        if (existingUser && existingUser.id !== req.userId) {
          return res.status(409).json({ error: 'Email already in use' });
        }

        updateUserData.email = email.toLowerCase();
      }

      if (password) {
        const hashedPassword = await bcrypt.hash(password, 8);
        updateUserData.password = hashedPassword;
      }

      // Get user's restaurant ID
      const user = await prisma.user.findUnique({
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

        await prisma.restaurant.update({
          where: { id: user.restaurantId },
          data: { address: restaurantAddress }
        });
      }

      const updatedUser = await prisma.user.update({
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
    } catch (error) {
      return res.status(400).json({
        error: error instanceof Error ? error.message : 'Error'
      });
    }
  }

  async uploadAvatar(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file provided' });
      }

      const avatarUrl = resolvePublicAssetUrl((req.file as any).publicUrl ?? `/uploads/avatars/${(req.file as any).filename}`);

      const user = await prisma.user.update({
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
    } catch (error) {
      return res.status(400).json({
        error: error instanceof Error ? error.message : 'Error'
      });
    }
  }
}