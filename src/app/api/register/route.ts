import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      email,
      password,
      firstName,
      lastName,
      dateOfBirth,
      profilePhoto,
      role
    } = body;

    // Check if user exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return new Response(JSON.stringify({ error: 'Email already in use' }), { status: 400 });
    }

    // Age check (must be 18+)
    const dob = new Date(dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - dob.getFullYear() -
                (today < new Date(dob.setFullYear(today.getFullYear())) ? 1 : 0);
    if (age < 18) {
      return new Response(JSON.stringify({ error: 'You must be at least 18 years old.' }), { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role,
        dateOfBirth: new Date(dateOfBirth),
        profilePhoto
      }
    });

    return new Response(JSON.stringify({ message: 'User created', user: newUser }), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Registration failed', detail: String(error) }), { status: 500 });
  }
}