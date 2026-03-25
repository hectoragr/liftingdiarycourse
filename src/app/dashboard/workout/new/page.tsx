import { auth } from '@clerk/nextjs/server';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { NewWorkoutForm } from './_components/NewWorkoutForm';

export default async function NewWorkoutPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) return null;

  const { date: dateStr } = await searchParams;

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>New workout</CardTitle>
            <CardDescription>Log a workout session.</CardDescription>
          </CardHeader>
          <CardContent>
            <NewWorkoutForm dateStr={dateStr} />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
