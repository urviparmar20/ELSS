import { z } from 'zod';

export const loginSchema = z.object({
  employeeId: z
    .string()
    .min(1, 'Employee ID is required'),

  password: z
    .string()
    .min(1, 'Password is required'),

    // .min(6, 'Password must be at least 6 characters'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
