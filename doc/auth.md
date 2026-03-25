# Auth Coding Standards

This project uses **Clerk v7** (`@clerk/nextjs`) for authentication. All auth must go through Clerk — do not implement custom session handling, JWTs, or cookie-based auth.

## Setup

`ClerkProvider` must wrap the entire app in the root layout (`src/app/layout.tsx`). It is already in place — do not add it again anywhere else.

```tsx
// src/app/layout.tsx
import { ClerkProvider } from "@clerk/nextjs";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ClerkProvider>
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
```

## Middleware

Clerk requires `clerkMiddleware()` in `src/middleware.ts` to function. If that file does not exist, create it:

```ts
// src/middleware.ts
import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
```

Routes are **public by default**. To protect a route via middleware, pass a handler to `clerkMiddleware` and call `auth.protect()`.

## Getting the Current User ID (Server)

Use `auth()` from `@clerk/nextjs/server` inside Server Components, Route Handlers, and Server Actions. This is the standard way to get a `userId` for database queries.

```ts
import { auth } from "@clerk/nextjs/server";

export default async function Page() {
  const { userId } = await auth();
  if (!userId) return null; // or redirect to sign-in
  // use userId for DB queries
}
```

- `auth()` returns `{ userId: string | null, ... }`.
- `userId` is `null` when the user is not signed in.
- Always check for `null` before using `userId`.

## Getting the Full User Object (Server)

Use `currentUser()` only when you need user profile data (name, email, image). Prefer `auth()` + `userId` for data queries — `currentUser()` makes a network call to the Clerk API and counts against rate limits.

```ts
import { currentUser } from "@clerk/nextjs/server";

const user = await currentUser();
if (!user) return null;

// user.firstName, user.lastName, user.emailAddresses, etc.
```

## Protecting Pages

### Option 1 — Manual check (preferred for pages)

```ts
import { auth } from "@clerk/nextjs/server";

export default async function ProtectedPage() {
  const { userId } = await auth();
  if (!userId) return null; // unauthenticated users see nothing
}
```

### Option 2 — `auth.protect()` (redirects unauthenticated users)

```ts
import { auth } from "@clerk/nextjs/server";

export default async function ProtectedPage() {
  const { userId } = await auth.protect();
  // throws a redirect to sign-in if not authenticated
}
```

Use `auth.protect()` when you want Clerk to handle the redirect automatically. Use the manual check when you want finer control over what is rendered or returned.

## Conditional UI Rendering (Client)

Use `<Show>` from `@clerk/nextjs` to show/hide UI based on auth state. This is a **Server Component** — use it in server-rendered layouts and pages.

```tsx
import { Show } from "@clerk/nextjs";

// Show content only to signed-in users
<Show when="signed-in">
  <UserButton />
</Show>

// Show content only to signed-out users
<Show when="signed-out">
  <SignInButton mode="modal">
    <button>Sign In</button>
  </SignInButton>
</Show>
```

`<Show>` also supports role/permission checks:

```tsx
<Show when={{ role: "admin" }}>
  <AdminPanel />
</Show>

<Show when={{ permission: "org:billing:manage" }} fallback={<p>Unauthorized</p>}>
  <BillingSettings />
</Show>
```

Do **not** use `useAuth()`, `useUser()`, or any client-side hook to gate server-rendered UI — use `<Show>` instead.

## Sign-In / Sign-Up Buttons

Use the Clerk-provided components. Always open in `mode="modal"` unless there is a specific reason to navigate to a dedicated page.

```tsx
import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";

<SignInButton mode="modal">
  <button>Sign In</button>
</SignInButton>

<SignUpButton mode="modal">
  <button>Sign Up</button>
</SignUpButton>

// Shows avatar + dropdown for signed-in user
<UserButton />
```

## Client-Side Auth Hooks

Use these only in Client Components (`"use client"`).

| Hook | Use case |
|---|---|
| `useAuth()` | Get `userId`, `isSignedIn`, `isLoaded` |
| `useUser()` | Get full user profile |
| `useClerk()` | Access Clerk instance (e.g., `clerk.signOut()`) |

```tsx
"use client";
import { useAuth } from "@clerk/nextjs";

export function MyClientComponent() {
  const { isSignedIn, userId } = useAuth();
  if (!isSignedIn) return null;
  // ...
}
```

Do **not** use client hooks to fetch data from the database. If a client component needs user-scoped data, pass it as props from a Server Component parent that calls `auth()`.

## Passing `userId` to Data Functions

`userId` must always come from the server-side `auth()` call — never from URL params, query strings, or the request body alone.

```ts
// Correct
const { userId } = await auth();
const workouts = await getWorkouts(userId);

// Wrong — userId from URL is untrusted
const workouts = await getWorkouts(params.userId);
```

See `data-fetching.md` for how `userId` flows into database queries.

## What NOT to Do

- Do not call `auth()` in a Client Component — it is server-only.
- Do not use `getServerSideProps` or `getStaticProps` — this project uses the App Router exclusively.
- Do not store `userId` or session tokens in `localStorage` or cookies manually.
- Do not create custom auth middleware or session validation logic.
- Do not use the legacy `withAuth` HOC or `getAuth` from older Clerk versions.

## Summary

| Concern | Answer |
|---|---|
| Auth provider | `ClerkProvider` in root layout |
| Get `userId` on server | `auth()` from `@clerk/nextjs/server` |
| Get full user on server | `currentUser()` from `@clerk/nextjs/server` |
| Conditional UI (server) | `<Show when="signed-in/out">` |
| Auth hooks (client) | `useAuth()`, `useUser()` |
| Sign-in/up UI | `<SignInButton>`, `<SignUpButton>`, `<UserButton>` |
| Route protection | `auth.protect()` or manual `userId` null-check |
