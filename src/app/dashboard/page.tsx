"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

function getOrdinalSuffix(day: number): string {
  if (day >= 11 && day <= 13) return "th";
  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

function formatDate(date: Date): string {
  const day = date.getDate();
  return `${day}${getOrdinalSuffix(day)} ${format(date, "MMM yyyy")}`;
}

const mockWorkouts = [
  {
    id: 1,
    name: "Bench Press",
    sets: 4,
    reps: 8,
    weight: 80,
  },
  {
    id: 2,
    name: "Squat",
    sets: 3,
    reps: 5,
    weight: 120,
  },
  {
    id: 3,
    name: "Deadlift",
    sets: 3,
    reps: 5,
    weight: 140,
  },
];

export default function DashboardPage() {
  const [date, setDate] = useState<Date>(new Date());
  const [open, setOpen] = useState(false);

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

        <div className="mb-6">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger
              className={buttonVariants({
                variant: "outline",
                className: "w-56 justify-start gap-2 text-left font-normal",
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
                    setOpen(false);
                  }
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex flex-col gap-3">
          {mockWorkouts.length === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-200 bg-white px-6 py-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                No workouts logged for {formatDate(date)}.
              </p>
            </div>
          ) : (
            mockWorkouts.map((workout) => (
              <div
                key={workout.id}
                className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-5 py-4 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                    {workout.name}
                  </span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {workout.sets} sets × {workout.reps} reps
                  </span>
                </div>
                <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  {workout.weight} kg
                </span>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
