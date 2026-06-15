"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, LogIn, LogOut, UserRound } from "lucide-react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { useAuth } from "@/lib/auth-context";
import {
  DEFAULT_PROFILE,
  readProfile,
  writeProfile,
  type Profile,
} from "@/lib/profile-store";
import { BUDGETS, PACES, FOOD_PREFERENCES } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SegmentedCard } from "@/components/ui/segmented-card";
import { OptionChip } from "@/components/ui/option-chip";
import { Button } from "@/components/ui/button";

export function ProfileClient() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [profile, setProfile] = React.useState<Profile>(DEFAULT_PROFILE);
  const [saved, setSaved] = React.useState(false);

  React.useEffect(() => {
    // Seed from localStorage, then prefer the signed-in user's saved defaults.
    const local = readProfile();
    const merged: Profile = user
      ? {
          fullName: user.fullName ?? local.fullName,
          email: user.email,
          defaultBudget: user.defaultBudget ?? local.defaultBudget,
          defaultTravelStyle: user.defaultTravelStyle ?? local.defaultTravelStyle,
          foodPreferences:
            user.foodPreferences.length > 0
              ? user.foodPreferences
              : local.foodPreferences,
        }
      : local;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- client-only seed
    setProfile(merged);
  }, [user]);

  function update<K extends keyof Profile>(key: K, value: Profile[K]) {
    setProfile((p) => ({ ...p, [key]: value }));
    setSaved(false);
  }

  function toggleFood(value: Profile["foodPreferences"][number]) {
    setProfile((p) => ({
      ...p,
      foodPreferences: p.foodPreferences.includes(value)
        ? p.foodPreferences.filter((f) => f !== value)
        : [...p.foodPreferences, value],
    }));
    setSaved(false);
  }

  function save() {
    writeProfile(profile);
    setSaved(true);
    // Logged in? Persist defaults to the cloud too (fire and forget).
    if (user) {
      void fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: profile.fullName || undefined,
          defaultBudget: profile.defaultBudget,
          defaultTravelStyle: profile.defaultTravelStyle,
          foodPreferences: profile.foodPreferences,
        }),
      }).catch(() => {});
    }
  }

  async function handleSignOut() {
    await logout();
    router.push("/");
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <header className="mb-6 flex items-center gap-3">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <UserRound className="size-6" />
        </span>
        <div>
          <h1 className="font-display text-2xl font-semibold">Profile</h1>
          <p className="text-muted-foreground">
            Defaults we&apos;ll prefill on your next trip.
          </p>
        </div>
        <ThemeToggle className="ml-auto" />
      </header>

      <div className="space-y-5">
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                value={profile.fullName}
                onChange={(e) => update("fullName", e.target.value)}
                placeholder="Your name"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="you@example.com"
                disabled={Boolean(user)}
              />
            </div>
            {user ? (
              <p className="flex items-center gap-1.5 text-sm text-emerald">
                <Check className="size-4" /> Signed in — your trips sync across
                devices.
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
                  Sign in
                </Link>{" "}
                to save your trips to the cloud and sync across devices.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Default budget</CardTitle>
          </CardHeader>
          <CardContent>
            <SegmentedCard
              options={BUDGETS}
              value={profile.defaultBudget}
              onChange={(v) => update("defaultBudget", v)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Travel style</CardTitle>
          </CardHeader>
          <CardContent>
            <SegmentedCard
              options={PACES}
              value={profile.defaultTravelStyle}
              onChange={(v) => update("defaultTravelStyle", v)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Food preferences</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2.5">
              {FOOD_PREFERENCES.map((opt) => (
                <OptionChip
                  key={opt.value}
                  label={opt.label}
                  icon={opt.icon}
                  selected={profile.foodPreferences.includes(opt.value)}
                  onToggle={() => toggleFood(opt.value)}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          {user ? (
            <Button variant="ghost" onClick={handleSignOut}>
              <LogOut className="size-4" /> Sign out
            </Button>
          ) : (
            <Button asChild variant="ghost">
              <Link href="/login">
                <LogIn className="size-4" /> Sign in
              </Link>
            </Button>
          )}
          <Button onClick={save}>
            {saved ? (
              <>
                <Check className="size-4" /> Saved
              </>
            ) : (
              "Save changes"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
