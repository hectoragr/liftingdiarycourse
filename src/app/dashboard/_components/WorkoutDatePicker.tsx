"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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

export function WorkoutDatePicker({ dateStr }: { dateStr: string }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!searchParams.get("tz")) {
      const tz = new Date().getTimezoneOffset();
      const localDate = new Date(+new Date() - tz * 60 * 1000).toISOString().slice(0, 10);
      router.replace(`/dashboard?date=${localDate}&tz=${tz}`);
    }
  }, [router, searchParams]);

  const localDate = new Date(`${dateStr}T00:00:00`);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={buttonVariants({
          variant: "outline",
          className: "w-56 justify-start gap-2 text-left font-normal",
        })}
      >
        <CalendarIcon className="h-4 w-4 text-zinc-500" />
        {formatDate(localDate)}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={localDate}
          onSelect={(d) => {
            if (d) {
              const tz = new Date().getTimezoneOffset();
              router.push(`/dashboard?date=${format(d, "yyyy-MM-dd")}&tz=${tz}`);
              setOpen(false);
            }
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
