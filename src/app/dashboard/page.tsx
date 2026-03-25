import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { format } from "date-fns";
import { getWorkoutsForDate } from "@/data/workouts";
import { WorkoutDatePicker } from "./_components/WorkoutDatePicker";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; tz?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) return null;

  const { date: dateParam, tz: tzParam } = await searchParams;
  const tzOffset = tzParam ? parseInt(tzParam) : 0;
  const dateStr = dateParam ?? new Date(+new Date() - tzOffset * 60 * 1000).toISOString().slice(0, 10);

  const workoutList = await getWorkoutsForDate(userId, dateStr, tzOffset);

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
        <div className="mb-8 flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Workout Log
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            View your logged workouts by date.
          </p>
        </div>

        <div className="mb-6 flex items-center justify-between gap-4">
          <WorkoutDatePicker dateStr={dateStr} />
          <Link
            href={`/dashboard/workout/new?date=${dateStr}`}
            className="inline-flex h-8 shrink-0 items-center justify-center rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/80"
          >
            New workout
          </Link>
        </div>

        <div className="flex flex-col gap-3">
          {workoutList.length === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-200 bg-white px-6 py-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                No workouts logged for this date.
              </p>
            </div>
          ) : (
            workoutList.map((workout) => (
              <div
                key={workout.id}
                className="flex items-start justify-between rounded-xl border border-zinc-200 bg-white px-5 py-4 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex flex-col gap-1.5">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                      {workout.name ?? "Untitled Workout"}
                    </span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      Started at {format(workout.startedAt, "h:mm a")}
                    </span>
                  </div>
                  {workout.workoutExercises.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {workout.workoutExercises.map((we) => (
                        <span
                          key={we.id}
                          className="rounded-md bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                        >
                          {we.exerciseDefinition.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                {workout.completedAt && (
                  <span className="ml-4 shrink-0 rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                    Completed
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
