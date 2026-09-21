"use client";

import { useActionState, useState } from "react";
import { signInAction, signUpAction, AuthFormState } from "@/lib/auth/actions";

const initialState: AuthFormState = {};

export function LoginForm() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const action = mode === "signin" ? signInAction : signUpAction;
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="flex gap-2 mb-6">
        <button
          type="button"
          onClick={() => setMode("signin")}
          className={`flex-1 text-sm font-medium py-2 rounded-lg border transition-colors ${
            mode === "signin"
              ? "bg-tl-accent text-black border-tl-accent"
              : "border-tl-border text-tl-text-secondary"
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => setMode("signup")}
          className={`flex-1 text-sm font-medium py-2 rounded-lg border transition-colors ${
            mode === "signup"
              ? "bg-tl-accent text-black border-tl-accent"
              : "border-tl-border text-tl-text-secondary"
          }`}
        >
          Create Account
        </button>
      </div>

      <form action={formAction} className="space-y-3">
        <div>
          <label htmlFor="email" className="block text-xs text-tl-text-muted mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            name="email"
            required
            autoComplete="email"
            className="w-full rounded-lg border border-tl-border bg-tl-bg-card px-3 py-2 text-sm text-tl-text-primary focus:outline-none focus:border-tl-accent"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-xs text-tl-text-muted mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            name="password"
            required
            minLength={8}
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            className="w-full rounded-lg border border-tl-border bg-tl-bg-card px-3 py-2 text-sm text-tl-text-primary focus:outline-none focus:border-tl-accent"
          />
        </div>

        {state.error && (
          <p className="text-sm text-tl-negative">{state.error}</p>
        )}
        {state.message && (
          <p className="text-sm text-tl-positive">{state.message}</p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full text-sm font-medium py-2.5 rounded-lg bg-tl-accent text-black hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {pending
            ? "Please wait…"
            : mode === "signin"
              ? "Sign In"
              : "Create Account"}
        </button>
      </form>

      <p className="text-xs text-tl-text-muted mt-4 text-center">
        {mode === "signin"
          ? "New here? Switch to \"Create Account\" above."
          : "Already have an account? Switch to \"Sign In\" above."}
      </p>
    </div>
  );
}
