import {
  pgTable, serial, text, varchar, integer,
  real, timestamp, index, uniqueIndex,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const exerciseDefinitions = pgTable(
  'exercise_definitions',
  {
    id:        serial('id').primaryKey(),
    userId:    text('user_id').notNull(),
    name:      varchar('name', { length: 255 }).notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('exercise_definitions_user_id_name_idx').on(table.userId, table.name),
  ]
);

export const workouts = pgTable(
  'workouts',
  {
    id:          serial('id').primaryKey(),
    userId:      text('user_id').notNull(),
    name:        varchar('name', { length: 255 }),
    startedAt:   timestamp('started_at').notNull(),
    completedAt: timestamp('completed_at'),
    createdAt:   timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    index('workouts_user_id_started_at_idx').on(table.userId, table.startedAt),
  ]
);

export const workoutExercises = pgTable(
  'workout_exercises',
  {
    id:                   serial('id').primaryKey(),
    workoutId:            integer('workout_id').notNull()
                            .references(() => workouts.id, { onDelete: 'cascade' }),
    exerciseDefinitionId: integer('exercise_definition_id').notNull()
                            .references(() => exerciseDefinitions.id, { onDelete: 'restrict' }),
    order:                integer('order').notNull(),
    createdAt:            timestamp('created_at').notNull().defaultNow(),
    updatedAt:            timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    index('workout_exercises_workout_id_idx').on(table.workoutId),
    index('workout_exercises_exercise_definition_id_idx').on(table.exerciseDefinitionId),
  ]
);

export const sets = pgTable(
  'sets',
  {
    id:                serial('id').primaryKey(),
    workoutExerciseId: integer('workout_exercise_id').notNull()
                         .references(() => workoutExercises.id, { onDelete: 'cascade' }),
    setNumber:         integer('set_number').notNull(),
    reps:              integer('reps').notNull(),
    weight:            real('weight').notNull(),
    createdAt:         timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    index('sets_workout_exercise_id_idx').on(table.workoutExerciseId),
  ]
);

export const exerciseDefinitionsRelations = relations(exerciseDefinitions, ({ many }) => ({
  workoutExercises: many(workoutExercises),
}));

export const workoutsRelations = relations(workouts, ({ many }) => ({
  workoutExercises: many(workoutExercises),
}));

export const workoutExercisesRelations = relations(workoutExercises, ({ one, many }) => ({
  workout: one(workouts, {
    fields: [workoutExercises.workoutId],
    references: [workouts.id],
  }),
  exerciseDefinition: one(exerciseDefinitions, {
    fields: [workoutExercises.exerciseDefinitionId],
    references: [exerciseDefinitions.id],
  }),
  sets: many(sets),
}));

export const setsRelations = relations(sets, ({ one }) => ({
  workoutExercise: one(workoutExercises, {
    fields: [sets.workoutExerciseId],
    references: [workoutExercises.id],
  }),
}));

export type ExerciseDefinition    = typeof exerciseDefinitions.$inferSelect;
export type NewExerciseDefinition = typeof exerciseDefinitions.$inferInsert;
export type Workout               = typeof workouts.$inferSelect;
export type NewWorkout            = typeof workouts.$inferInsert;
export type WorkoutExercise       = typeof workoutExercises.$inferSelect;
export type NewWorkoutExercise    = typeof workoutExercises.$inferInsert;
export type Set                   = typeof sets.$inferSelect;
export type NewSet                = typeof sets.$inferInsert;
