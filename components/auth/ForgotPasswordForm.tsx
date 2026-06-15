"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, KeyRound, Loader2, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ForgotPasswordForm() {
  const [email, setEmail] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [sent, setSent] = React.useState(false);
  const [devLink, setDevLink] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      setSent(true);
      if (data.devLink) setDevLink(data.devLink);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md px-6 py-12">
      <div className="mb-8 flex flex-col items-center text-center">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          {sent ? <MailCheck className="size-6" /> : <KeyRound className="size-6" />}
        </span>
        <h1 className="mt-3 font-display text-2xl font-semibold">
          {sent ? "Check your email" : "Forgot your password?"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {sent
            ? "If an account exists for that email, we've sent a link to reset your password."
            : "Enter your email and we'll send you a reset link."}
        </p>
      </div>

      {sent ? (
        <div className="space-y-4">
          {devLink ? (
            <div className="rounded-xl border border-border bg-muted/40 p-3 text-sm">
              <p className="mb-1 font-medium">Dev mode — no email provider set:</p>
              <Link href={devLink} className="break-all text-primary underline-offset-4 hover:underline">
                {devLink}
              </Link>
            </div>
          ) : null}
          <Button asChild variant="outline" className="w-full">
            <Link href="/login">
              <ArrowLeft className="size-4" /> Back to sign in
            </Link>
          </Button>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>
          {error ? (
            <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}
          <Button type="submit" size="lg" className="w-full" disabled={busy}>
            {busy ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Sending…
              </>
            ) : (
              "Send reset link"
            )}
          </Button>
          <Button asChild variant="ghost" className="w-full">
            <Link href="/login">
              <ArrowLeft className="size-4" /> Back to sign in
            </Link>
          </Button>
        </form>
      )}
    </div>
  );
}
