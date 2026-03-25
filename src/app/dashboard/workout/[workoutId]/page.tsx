import { notFound } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getWorkoutById } from '@/data/workouts';
import { EditWorkoutForm } from './_components/EditWorkoutForm';

export default async function EditWorkoutPage({
  params,
}: {
  params: Promise<{ workoutId: string }>;
}) {
  const { userId } = await auth();
  if (!userId) return null;

  const { workoutId: workoutIdStr } = await params;
  const workoutId = parseInt(workoutIdStr, 10);
  if (isNaN(workoutId)) notFound();

  const workout = await getWorkoutById(userId, workoutId);
  if (!workout) notFound();

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Edit workout</CardTitle>
            <CardDescription>Update your workout details.</CardDescription>
          </CardHeader>
          <CardContent>
            <EditWorkoutForm
              workoutId={workout.id}
              initialName={workout.name ?? null}
              initialStartedAt={workout.startedAt}
            />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
