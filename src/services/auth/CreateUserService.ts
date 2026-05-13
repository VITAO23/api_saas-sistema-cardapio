import bcrypt from 'bcryptjs';
import { prisma } from '../../lib/prisma';

interface IRequest {
  name: string;
  email: string;
  password: string;
  restaurantId: string;
}

export class CreateUserService {
  async execute({ name, email, password, restaurantId }: IRequest) {
    const normalizedEmail = email.trim().toLowerCase();

    // Validate email format (simple)
    if (!normalizedEmail.includes('@')) {
      throw new Error('Invalid email');
    }

    // Check if user already exists
    const userExists = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (userExists) {
      throw new Error('User already exists');
    }

    const restaurantExists = await prisma.restaurant.findUnique({
      where: { id: restaurantId }
    });

    if (!restaurantExists) {
      throw new Error('Restaurant not found');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        password: hashedPassword,
        role: 'owner',
        restaurantId
      }
    });

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    return userWithoutPassword;
  }
}
