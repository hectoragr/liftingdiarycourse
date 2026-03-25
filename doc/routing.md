# Routing

## Rule: All App Routes Live Under `/dashboard`

All authenticated user-facing routes must be nested under `/dashboard`. There are no top-level feature routes.

```
src/app/
  page.tsx                             # Public landing/home page
  dashboard/
    page.tsx                           # /dashboard — workout list
    workout/
      new/
        page.tsx                       # /dashboard/workout/new
      [workoutId]/
        page.tsx                       # /dashboard/workout/:workoutId
```

Do not create feature routes outside of `/dashboard` (e.g. `/workouts`, `/profile`). New pages must be added as sub-routes of `/dashboard`.

## Rule: `/dashboard` and All Sub-Routes Are Protected

Every route under `/dashboard` requires authentication. Unauthenticated users must be redirected to sign-in — they must never see dashboard content.

Protection is enforced at the **middleware layer**, not per-page. Do not add `auth()` null-checks to individual page files as the primary protection mechanism for dashboard routes.

## Rule: Route Protection Is Done in `src/middleware.ts`

Use `clerkMiddleware` with a route matcher to protect all `/dashboard` routes centrally.

```ts
// src/middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
```

`auth.protect()` redirects unauthenticated users to the Clerk sign-in flow automatically. Do not implement a custom redirect — let Clerk handle it.

## Rule: Public Routes Are Explicitly Not Protected

Routes outside of `/dashboard` (e.g. the root `/` landing page) are public by default. Do not add `isProtectedRoute` matchers to them — Clerk routes are public unless explicitly protected.

## What NOT to Do

- Do not scatter `if (!userId) redirect('/sign-in')` calls across dashboard page files — middleware handles this.
- Do not create feature routes at the top level (e.g. `/workouts/new`). All routes belong under `/dashboard`.
- Do not use `getServerSideProps` or middleware from Next.js 12–14 patterns — this project uses App Router and `clerkMiddleware`.

## Summary

| Concern | Answer |
|---|---|
| Where do app routes live? | Under `/dashboard` |
| How are dashboard routes protected? | `clerkMiddleware` + `createRouteMatcher` in `src/middleware.ts` |
| What happens to unauthenticated users? | `auth.protect()` redirects them to Clerk sign-in |
| Are routes protected per-page? | No — middleware is the single enforcement point |
| Where does the public landing page live? | `src/app/page.tsx` at `/` |
