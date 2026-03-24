import { and, eq, gte, lt } from 'drizzle-orm';
import { db } from '@/db';
import { workoutExercises, workouts } from '@/db/schema';

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
