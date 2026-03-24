# Data Fetching

## Rule: Server Components Only

All data fetching happens exclusively in **React Server Components**. This is non-negotiable.

- **No** `fetch()` calls in client components
- **No** Route Handlers (`app/api/`) for reading data
- **No** `useEffect` + fetch patterns
- **No** SWR, React Query, or any client-side data fetching library for db data
- **No** raw SQL — Drizzle ORM queries only

If a component needs data, it must either be a Server Component itself, or receive the data as props passed down from a Server Component ancestor.

## Rule: All DB Queries Live in `/data`

Database queries must not be written inline in page or layout files. Every query must live in a dedicated helper function under `src/data/`.

```
src/
  data/
    workouts.ts          # getWorkouts(), getWorkoutById(), etc.
    exercises.ts         # getExerciseDefinitions(), etc.
    sets.ts              # getSetsForWorkoutExercise(), etc.
```

Helper functions are plain async functions — no classes, no singleton wrappers needed.

```ts
// src/data/workouts.ts
import { db } from '@/db';
import { workouts } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function getWorkouts(userId: string) {
  return db
    .select()
    .from(workouts)
    .where(eq(workouts.userId, userId));
}
```

Then in a Server Component:

```tsx
// src/app/dashboard/page.tsx
import { getWorkouts } from '@/data/workouts';
import { auth } from '@/auth'; // however auth is exposed

export default async function DashboardPage() {
  const session = await auth();
  const data = await getWorkouts(session.user.id);
  return <WorkoutList items={data} />;
}
```

## Rule: Always Scope Queries to the Authenticated User

Every query that touches user-owned data (`workouts`, `exercise_definitions`, `workout_exercises`, `sets`) **must** filter by `userId`. A logged-in user must never be able to read or modify another user's records.

**Correct:**

```ts
export async function getWorkoutById(userId: string, workoutId: number) {
  const [workout] = await db
    .select()
    .from(workouts)
    .where(
      and(
        eq(workouts.id, workoutId),
        eq(workouts.userId, userId),   // ← required
      )
    );
  return workout ?? null;
}
```

**Wrong — never do this:**

```ts
// Missing userId filter — any user could fetch any workout
export async function getWorkoutById(workoutId: number) {
  const [workout] = await db
    .select()
    .from(workouts)
    .where(eq(workouts.id, workoutId));
  return workout;
}
```

The `userId` must come from the server-side session, never from a URL parameter, query string, or request body alone. Always validate that the resource belongs to the authenticated user before returning or mutating it.

### Indirect ownership (joined tables)

`workout_exercises` and `sets` do not have a direct `userId` column. Ownership must be verified by joining back to `workouts`:

```ts
export async function getSetsForWorkoutExercise(
  userId: string,
  workoutExerciseId: number,
) {
  return db
    .select({ set: sets })
    .from(sets)
    .innerJoin(workoutExercises, eq(sets.workoutExerciseId, workoutExercises.id))
    .innerJoin(workouts, eq(workoutExercises.workoutId, workouts.id))
    .where(
      and(
        eq(sets.workoutExerciseId, workoutExerciseId),
        eq(workouts.userId, userId),   // ← ownership enforced via join
      )
    );
}
```

## Summary

| Concern | Answer |
|---|---|
| Where do queries run? | Server Components only |
| Where do queries live? | `src/data/` helper functions |
| What ORM? | Drizzle — no raw SQL |
| Who can see the data? | Only the authenticated user who owns it |
