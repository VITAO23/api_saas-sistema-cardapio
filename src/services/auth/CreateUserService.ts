import bcrypt from 'bcryptjs';
import { prisma } from '../../lib/prisma';

interface IRequest {
  name: string;
  email: string;
  password: string;
}

export class CreateUserService {
  async execute({ name, email, password }: IRequest) {
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

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
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
