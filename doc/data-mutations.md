# Data Mutations

## Rule: All DB Mutations Live in `/data`

Database mutations must not be written inline in Server Actions or page files. Every mutation must live in a dedicated helper function under `src/data/`, co-located with the query helpers for the same entity.

```
src/
  data/
    workouts.ts          # createWorkout(), deleteWorkout(), updateWorkout(), etc.
    exercises.ts         # createExerciseDefinition(), etc.
    sets.ts              # createSet(), updateSet(), deleteSet(), etc.
```

Helper functions are plain async functions — no classes, no singleton wrappers needed.

```ts
// src/data/workouts.ts
import { db } from '@/db';
import { workouts } from '@/db/schema';

export async function createWorkout(userId: string, startedAt: Date, name?: string) {
  const [workout] = await db
    .insert(workouts)
    .values({ userId, startedAt, name })
    .returning();
  return workout;
}
```

## Rule: All Mutations Are Triggered via Server Actions

Mutations must never be called directly from client components. All writes go through **Server Actions** defined in co-located `actions.ts` files.

```
src/
  app/
    dashboard/
      actions.ts         # Server Actions for the dashboard route
    workout/
      [id]/
        actions.ts       # Server Actions scoped to the workout detail route
```

Server Actions call the `src/data/` helpers — they do not contain raw Drizzle queries themselves.

```ts
// src/app/dashboard/actions.ts
'use server';

import { createWorkout } from '@/data/workouts';
import { auth } from '@/auth';

export async function createWorkoutAction(input: CreateWorkoutInput) {
  // 1. validate
  // 2. get session
  // 3. call data helper
}
```

## Rule: Server Action Parameters Must Be Typed — No `FormData`

Every Server Action must accept a typed object, not `FormData`. Define an explicit input type for each action.

**Correct:**

```ts
type CreateWorkoutInput = {
  startedAt: Date;
  name?: string;
};

export async function createWorkoutAction(input: CreateWorkoutInput) { ... }
```

**Wrong — never do this:**

```ts
// FormData is untyped and bypasses validation
export async function createWorkoutAction(formData: FormData) { ... }
```

## Rule: All Server Actions Must Validate Their Arguments

Every Server Action must validate its input before doing anything else. Use **Zod** for all validation.

```ts
// src/app/dashboard/actions.ts
'use server';

import { z } from 'zod';
import { auth } from '@/auth';
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

  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthenticated');

  return createWorkout(session.user.id, parsed.data.startedAt, parsed.data.name);
}
```

## Rule: Always Scope Mutations to the Authenticated User

The `userId` used in every mutation must come from the **server-side session**, never from the client. Never trust a `userId` passed in the action input.

Data helpers for entities without a direct `userId` column (e.g. `workout_exercises`, `sets`) must verify ownership by joining back through `workouts` before mutating.

**Correct:**

```ts
// src/data/sets.ts
export async function deleteSet(userId: string, setId: number) {
  // verify ownership via join before deleting
  const [existing] = await db
    .select({ id: sets.id })
    .from(sets)
    .innerJoin(workoutExercises, eq(sets.workoutExerciseId, workoutExercises.id))
    .innerJoin(workouts, eq(workoutExercises.workoutId, workouts.id))
    .where(
      and(
        eq(sets.id, setId),
        eq(workouts.userId, userId),   // ← ownership check
      )
    );

  if (!existing) throw new Error('Not found');

  await db.delete(sets).where(eq(sets.id, setId));
}
```

**Wrong — never do this:**

```ts
// No ownership check — any user could delete any set
export async function deleteSet(setId: number) {
  await db.delete(sets).where(eq(sets.id, setId));
}
```

## Summary

| Concern | Answer |
|---|---|
| Where do mutation helpers live? | `src/data/` — one file per entity |
| Where are mutations triggered? | Server Actions in co-located `actions.ts` files |
| What parameter type for actions? | Typed object — never `FormData` |
| Must actions validate input? | Yes — always, using Zod |
| Where does `userId` come from? | Server-side session only — never from client input |
| What ORM? | Drizzle — no raw SQL |
