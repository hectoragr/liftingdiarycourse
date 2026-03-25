import { and, eq, gte, lt } from 'drizzle-orm';
import { db } from '@/db';
import { workoutExercises, workouts } from '@/db/schema';

export async function createWorkout(userId: string, startedAt: Date, name?: string) {
  const [workout] = await db
    .insert(workouts)
    .values({ userId, startedAt, name })
    .returning();
  return workout;
}

export async function getWorkoutById(userId: string, workoutId: number) {
  const [workout] = await db
    .select()
    .from(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)));
  return workout ?? null;
}

export async function updateWorkout(
  userId: string,
  workoutId: number,
  data: { name?: string | null; startedAt: Date },
) {
  const [workout] = await db
    .update(workouts)
    .set({ name: data.name ?? null, startedAt: data.startedAt })
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)))
    .returning();
  return workout ?? null;
}

export async function getWorkoutsForDate(userId: string, dateStr: string, tzOffset: number = 0) {
  const offsetMs = tzOffset * 60 * 1000;
  const start = new Date(new Date(`${dateStr}T00:00:00.000Z`).getTime() + offsetMs);
  const end = new Date(new Date(`${dateStr}T23:59:59.999Z`).getTime() + offsetMs);

  return db.query.workouts.findMany({
    where: and(
      eq(workouts.userId, userId),
      gte(workouts.startedAt, start),
      lt(workouts.startedAt, end),
    ),
    with: {
      workoutExercises: {
        orderBy: workoutExercises.order,
        with: {
          exerciseDefinition: true,
        },
      },
    },
    orderBy: workouts.startedAt,
  });
}
