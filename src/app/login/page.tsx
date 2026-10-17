"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const params = useSearchParams();
  const next = params.get("next") ?? "/account";
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">(
    params.get("error") ? "error" : "idle"
  );

  async function sendLink(e: React.FormEvent) {
    e.preventDefault();
    setState("sending");
    const { error } = await createClient().auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    setState(error ? "error" : "sent");
  }

  async function google() {
    await createClient().auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 px-4">
      <div>
        <h1 className="text-2xl font-semibold">Sign in to Printribe</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Track orders and reuse your saved designs.
        </p>
      </div>

      {state === "sent" ? (
        <p className="rounded-lg bg-tribe-light p-4 text-sm">
          Check <b>{email}</b> for your sign-in link.
        </p>
      ) : (
        <form onSubmit={sendLink} className="flex flex-col gap-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="rounded-lg border border-neutral-300 bg-white px-3 py-3 text-base outline-none focus:border-tribe"
          />
          <button
            disabled={state === "sending"}
            className="rounded-lg bg-tribe px-3 py-3 font-medium text-white hover:bg-tribe-dark disabled:opacity-60"
          >
            {state === "sending" ? "Sending…" : "Email me a sign-in link"}
          </button>
          {state === "error" && (
            <p className="text-sm text-tribe-dark">Something went wrong. Please try again.</p>
          )}
        </form>
      )}

      <button
        onClick={google}
        className="rounded-lg border border-neutral-300 bg-white px-3 py-3 font-medium hover:bg-neutral-50"
      >
        Continue with Google
      </button>
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
