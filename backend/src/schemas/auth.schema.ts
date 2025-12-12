import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email({ message: 'Neteisingas el. pašto formatas' }),
  password: z.string().min(3, { message: 'Slaptažodis turi būti bent 3 simbolių ilgio' }),
  username: z.string().min(3, { message: 'Vartotojo vardas turi būti bent 3 simbolių ilgio' }).max(100),
  role: z.enum(['user', 'author']).optional().default('user'),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
