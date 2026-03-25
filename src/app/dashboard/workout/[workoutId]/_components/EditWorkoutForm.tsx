'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { updateWorkoutAction } from '../actions';

function getOrdinalSuffix(day: number): string {
  if (day >= 11 && day <= 13) return 'th';
  switch (day % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
}

function formatDate(date: Date): string {
  const day = date.getDate();
  return `${day}${getOrdinalSuffix(day)} ${format(date, 'MMM yyyy')}`;
}

type Props = {
  workoutId: number;
  initialName: string | null;
  initialStartedAt: Date;
};

export function EditWorkoutForm({ workoutId, initialName, initialStartedAt }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(initialName ?? '');
  const [date, setDate] = useState<Date>(() => {
    const d = new Date(initialStartedAt);
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [hour, setHour] = useState(() => new Date(initialStartedAt).getHours());
  const [minute, setMinute] = useState(() => new Date(initialStartedAt).getMinutes());
  const [calendarOpen, setCalendarOpen] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const startedAt = new Date(date);
    startedAt.setHours(hour, minute, 0, 0);
    startTransition(async () => {
      await updateWorkoutAction(workoutId, {
        startedAt,
        name: name.trim() || undefined,
      });
      router.push('/dashboard');
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Workout name</Label>
        <Input
          id="name"
          type="text"
          placeholder="e.g. Upper body, Leg day…"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={255}
        />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Optional &mdash; leave blank for &ldquo;Untitled Workout&rdquo;.</p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="flex flex-col gap-2">
          <Label>Date</Label>
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger
              className={buttonVariants({
                variant: 'outline',
                className: 'w-48 justify-start gap-2 text-left font-normal',
              })}
            >
              <CalendarIcon className="h-4 w-4 text-zinc-500" />
              {formatDate(date)}
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => {
                  if (d) {
                    setDate(d);
                    setCalendarOpen(false);
                  }
                }}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex flex-col gap-2">
          <Label>Time</Label>
          <div className="flex items-center gap-1">
            <select
              value={hour}
              onChange={(e) => setHour(Number(e.target.value))}
              className="h-8 rounded-lg border border-input bg-background px-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
            >
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={i}>{String(i).padStart(2, '0')}</option>
              ))}
            </select>
            <span className="text-sm text-zinc-500">:</span>
            <select
              value={minute}
              onChange={(e) => setMinute(Number(e.target.value))}
              className="h-8 rounded-lg border border-input bg-background px-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
            >
              {Array.from({ length: 60 }, (_, i) => (
                <option key={i} value={i}>{String(i).padStart(2, '0')}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Saving…' : 'Save changes'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isPending}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
