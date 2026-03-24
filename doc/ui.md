# UI Coding Standards

## Component Library

All UI components must use **shadcn/ui** exclusively. Do not create custom components.

- Add new components via the shadcn CLI: `npx shadcn@latest add <component>`
- Compose complex UI from shadcn primitives rather than building from scratch
- Do not write custom component abstractions wrapping shadcn components unless strictly necessary for business logic

## Date Formatting

All dates must be formatted using **date-fns**. Do not use `Date.toLocaleDateString`, `Intl.DateTimeFormat`, or any other date formatting approach.

### Format

Dates must display as ordinal day + abbreviated or full month name + full year:

```
1st Sep 2025
2nd Aug 2025
3rd March 2026
4th Jan 2026
```

### Implementation

Use `format` and `getDate` from `date-fns` with a custom ordinal suffix:

```ts
import { format } from "date-fns";

function getOrdinalSuffix(day: number): string {
  if (day >= 11 && day <= 13) return "th";
  switch (day % 10) {
    case 1: return "st";
    case 2: return "nd";
    case 3: return "rd";
    default: return "th";
  }
}

function formatDate(date: Date): string {
  const day = date.getDate();
  return `${day}${getOrdinalSuffix(day)} ${format(date, "MMM yyyy")}`;
}
```

Examples:
- `formatDate(new Date("2025-09-01"))` → `1st Sep 2025`
- `formatDate(new Date("2025-08-02"))` → `2nd Aug 2025`
- `formatDate(new Date("2026-03-03"))` → `3rd March 2026`
