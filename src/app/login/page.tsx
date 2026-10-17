"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const params = useSearchParams();
  const next = params.get("next");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState(params.get("error") ? "Sign-in failed. Please try again." : "");

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setProblem("");
    const { error } = await createClient().auth.signInWithPassword({ email: email.trim(), password });
    if (error) {
      setProblem(
        error.status === 400 || /invalid login/i.test(error.message)
          ? "Incorrect email or password."
          : error.message
      );
      setBusy(false);
      return;
    }
    // A full page load makes sure the new session cookie is sent; /auth/continue picks the right page.
    window.location.assign(`/auth/continue${next ? `?next=${encodeURIComponent(next)}` : ""}`);
  }

  const field =
    "rounded-lg border border-neutral-300 bg-white px-3 py-3 text-base outline-none focus:border-tribe";

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 px-4">
      <div>
        <h1 className="text-2xl font-semibold">Sign in to Printribe</h1>
        <p className="mt-1 text-sm text-neutral-600">Enter your email and password.</p>
      </div>

      <form onSubmit={signIn} className="flex flex-col gap-3">
        <input
          type="email"
          required
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className={field}
        />
        <input
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className={field}
        />
        <button
          disabled={busy}
          className="rounded-lg bg-tribe px-3 py-3 font-medium text-white hover:bg-tribe-dark disabled:opacity-60"
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>
        {problem && (
          <p role="alert" className="text-sm text-tribe-dark">
            {problem}
          </p>
        )}
      </form>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
