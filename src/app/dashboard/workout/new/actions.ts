'use server';

import { z } from 'zod';
import { auth } from '@clerk/nextjs/server';
import { createWorkout } from '@/data/workouts';

const createWorkoutSchema = z.object({
  startedAt: z.date(),
  name: z.string().min(1).max(255).optional(),
});

type CreateWorkoutInput = z.infer<typeof createWorkoutSchema>;

export async function createWorkoutAction(input: CreateWorkoutInput) {
  const parsed = createWorkoutSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error('Invalid input');
  }

  const { userId } = await auth();
  if (!userId) throw new Error('Unauthenticated');

  return createWorkout(userId, parsed.data.startedAt, parsed.data.name);
}
