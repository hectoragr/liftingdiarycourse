'use client';

import { useAuth, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';

export function Header() {
  const { isSignedIn } = useAuth();

  return (
    <header>
      {!isSignedIn ? (
        <div className="flex gap-2">
          <SignInButton mode="modal">
            <button className="inline-flex h-8 items-center justify-center rounded-lg border border-transparent bg-primary px-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/80 focus-visible:outline-none">Sign In</button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button className="inline-flex h-8 items-center justify-center rounded-lg border border-border bg-background px-2.5 text-sm font-medium transition-all hover:bg-muted focus-visible:outline-none">Sign Up</button>
          </SignUpButton>
        </div>
      ) : (
        <UserButton />
      )}
    </header>
  );
}
