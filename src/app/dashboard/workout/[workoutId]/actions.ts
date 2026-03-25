'use server';

import { z } from 'zod';
import { auth } from '@clerk/nextjs/server';
import { updateWorkout } from '@/data/workouts';

const updateWorkoutSchema = z.object({
  startedAt: z.date(),
  name: z.string().min(1).max(255).optional(),
});

type UpdateWorkoutInput = z.infer<typeof updateWorkoutSchema>;

export async function updateWorkoutAction(workoutId: number, input: UpdateWorkoutInput) {
  const parsed = updateWorkoutSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error('Invalid input');
  }

  const { userId } = await auth();
  if (!userId) throw new Error('Unauthenticated');

  const workout = await updateWorkout(userId, workoutId, {
    startedAt: parsed.data.startedAt,
    name: parsed.data.name,
  });

  if (!workout) throw new Error('Workout not found');

  return workout;
}
